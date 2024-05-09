import React, { useState, useMemo, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css"; // Core styles
import "ag-grid-community/styles/ag-theme-alpine.css"; // Theme
import Navbar from "./Navbar";
import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  split,
  gql,
} from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { WebSocketLink } from "@apollo/client/link/ws";
import { useSelector, useDispatch } from "react-redux";
import Lottie from "react-lottie";
import * as animationData from "../loading.json";
import { setUsersData } from "../Store/usersSlice";
export const GRAPHQL_ENDPOINT = "https://unextra.hasura.app/v1/graphql";
export const GRAPHQL_SUBSCRIPTIONS = "wss://unextra.hasura.app/v1/graphql";
export const SECRET_KEY = "2tGF4WeLMIOsP/Q/h/VS2cd++EmJzMcb";
export const AUTH_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwczovL2hhc3VyYS5pby9qd3QvY2xhaW1zIjp7IngtaGFzdXJhLWFsbG93ZWQtcm9sZXMiOlsiYW5vbnltb3VzIl0sIngtaGFzdXJhLWRlZmF1bHQtcm9sZSI6ImFub255bW91cyJ9fQ.HM2vL95bDWL2xTMwCXXDatxlfLMd_8-Mx1ymyMiCKb4";

const createApolloClient = () => {
  const httpLink = new HttpLink({
    uri: GRAPHQL_ENDPOINT,
    headers: {
      Authorization: `Bearer ${AUTH_JWT}`,
    },
  });

  const wsLink = new WebSocketLink({
    uri: GRAPHQL_SUBSCRIPTIONS,
    headers: {
      Authorization: `Bearer ${AUTH_JWT}`,
    },
    options: {
      reconnect: true,
    },
  });

  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === "OperationDefinition" &&
        definition.operation === "subscription"
      );
    },
    wsLink,
    httpLink
  );

  return new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache(),
  });
};

const Statistiques = () => {
  const client = createApolloClient();

  const usersData = useSelector((state) => state.users.usersData);
  const [rowData, setRowData] = useState([]);
  const [jobStats, setJobStats] = useState([]);
  const [categoryEmployerStats, setCategoryEmployerStats] = useState([]);
  const [activeUserStats, setActiveUserStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const dispatch = useDispatch();

  useEffect(() => {
    if (usersData.length == 0) {
      fetchData();
    } else {
      const transformedData = transformData(usersData);
      setRowData(transformedData);
      setJobStats(calculateJobStats(usersData));
      setCategoryEmployerStats(calculateCategoryStats(usersData, "EMPLOYER"));
      setActiveUserStats(calculateActiveUserStats(usersData));
      setIsLoading(false);
    }
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data } = await client.query({
        query: gql`
          query {
            user {
              email
              id
              category
              city
              phoneNumber
              picUrl
              postalCode
              recherche
              type
              firstName
              admin
              lastName
              isActiveSub
              isActivePurchase
              creationTime
              googlePlaceAddress
              purchases {
                limit
                creationTime
                id
                store
                type
              }
              subscriptions {
                creationTime
                id
                active
                store
                type
              }
              company {
                name
              }
              extra {
                job
              }
              sendinblue {
                lastConnection
                os
                version
              }
            }
          }
        `,
      });
      dispatch(setUsersData(data.user));
      const transformedData = transformData(data.user);
      setRowData(transformedData);
      setJobStats(calculateJobStats(data.user));
      setCategoryEmployerStats(calculateCategoryStats(data.user, "EMPLOYER"));
      setActiveUserStats(calculateActiveUserStats(data.user));
    } catch (error) {
      console.error("Error fetching players data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const columnDefs = useMemo(
    () => [
      { headerName: "Semaine", field: "week" },
      { headerName: "Total Utilisateurs", field: "total" },
      { headerName: "EXTRA", field: "extra" },
      { headerName: "EMPLOYER", field: "employer" },
    ],
    []
  );

  const jobColumnDefs = useMemo(
    () => [
      { headerName: "Métier", field: "job" },
      { headerName: "Nombre", field: "count" },
    ],
    []
  );

  const categoryColumnDefs = useMemo(
    () => [
      { headerName: "Catégorie", field: "category" },
      { headerName: "Nombre", field: "count" },
    ],
    []
  );

  const activeUserColumnDefs = useMemo(
    () => [
      { headerName: "Type", field: "type" },
      { headerName: "Actifs", field: "active" },
      { headerName: "Total", field: "total" },
    ],
    []
  );

  function getWeekNumber(date) {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(Date.UTC(d.getFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  }

  // Fonction pour obtenir l'année et la semaine
  function getYearWeek(date) {
    const d = new Date(date);
    const weekNumber = getWeekNumber(date);
    return `${d.getFullYear()}-S${String(weekNumber).padStart(2, "0")}`;
  }

  // Fonction pour obtenir le premier jour de la semaine
  function getFirstDayOfWeek(year, week) {
    const firstDayOfYear = new Date(Date.UTC(year, 0, 1));
    const daysOffset = (week - 1) * 7;
    const firstDayOfWeek = new Date(
      firstDayOfYear.setDate(firstDayOfYear.getDate() + daysOffset)
    );
    const dayOfWeek = firstDayOfWeek.getUTCDay() || 7;
    return new Date(
      firstDayOfWeek.setDate(firstDayOfWeek.getDate() + (1 - dayOfWeek))
    );
  }

  // Fonction pour transformer les données
  function transformData(users) {
    // Initialise un objet vide pour stocker les données
    const weeklyData = {};

    users.forEach((user) => {
      if (!user.creationTime) return;

      const creationDate = parseInt(user.creationTime, 10);
      const yearWeek = getYearWeek(creationDate);

      if (!weeklyData[yearWeek]) {
        const [year, week] = yearWeek.split("-S").map(Number);
        weeklyData[yearWeek] = {
          week: yearWeek,
          total: 0,
          extra: 0,
          employer: 0,
          weekStartDate: getFirstDayOfWeek(year, week).toISOString(),
        };
      }

      weeklyData[yearWeek].total += 1;

      if (user.type === "EXTRA") {
        weeklyData[yearWeek].extra += 1;
      } else if (user.type === "EMPLOYER") {
        weeklyData[yearWeek].employer += 1;
      }
    });

    // Transforme l'objet en tableau et trie de la semaine la plus récente à la plus ancienne
    return Object.values(weeklyData)
      .sort((a, b) => new Date(b.weekStartDate) - new Date(a.weekStartDate))
      .map(({ week, total, extra, employer }) => ({
        week,
        total,
        extra,
        employer,
      }));
  }

  function calculateJobStats(users) {
    const jobData = {};
    users.forEach((user) => {
      if (user.type === "EXTRA" && user.extra?.job) {
        const job = user.extra.job;
        if (!jobData[job]) {
          jobData[job] = 0;
        }
        jobData[job] += 1;
      }
    });

    return Object.entries(jobData)
      .map(([job, count]) => ({ job, count }))
      .sort((a, b) => b.count - a.count);
  }

  function calculateCategoryStats(users, userType) {
    const categoryData = {};
    users.forEach((user) => {
      if (user.type === userType && user.category) {
        const category = user.category;
        if (!categoryData[category]) {
          categoryData[category] = 0;
        }
        categoryData[category] += 1;
      }
    });

    return Object.entries(categoryData)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }

  function calculateActiveUserStats(users) {
    const stats = {
      EXTRA: { type: "EXTRA", active: 0, total: 0 },
      EMPLOYER: { type: "EMPLOYER", active: 0, total: 0 },
    };

    users.forEach((user) => {
      if (user.type === "EXTRA" || user.type === "EMPLOYER") {
        stats[user.type].total += 1;
        if (user.isActiveSub || user.isActivePurchase) {
          stats[user.type].active += 1;
        }
      }
    });

    const totalActive = stats.EXTRA.active + stats.EMPLOYER.active;
    const totalUsers = stats.EXTRA.total + stats.EMPLOYER.total;

    return [
      { type: "TOTAL", active: totalActive, total: totalUsers },
      stats.EXTRA,
      stats.EMPLOYER,
    ];
  }

  return (
    <div className="container mt-5" style={{ paddingBottom: 200 }}>
      <Navbar detail={false} />
      {isLoading ? (
        <div className="text-center">
          <Lottie
            options={{
              loop: true,
              autoplay: true,
              animationData: animationData,
            }}
            height={200}
            width={200}
          />
        </div>
      ) : (
        <>
          <div
            className="ag-theme-alpine"
            style={{ width: "100%", marginTop: 30 }}
          >
            <h3>Inscriptions par semaine</h3>
            <AgGridReact
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={{ sortable: true, filter: true }}
              domLayout="autoHeight"
              pagination={true}
              paginationPageSize={10}
            />
          </div>
          <div
            className="ag-theme-alpine"
            style={{
              width: "100%",
              marginTop: 30,
            }}
          >
            <h3>Classement métiers EXTRA</h3>
            <AgGridReact
              rowData={jobStats}
              columnDefs={jobColumnDefs}
              defaultColDef={{ sortable: true, filter: true }}
              domLayout="autoHeight"
              pagination={true}
              paginationPageSize={10}
            />
          </div>
          <div
            className="ag-theme-alpine"
            style={{
              width: "100%",
              marginTop: 30,
            }}
          >
            <h3>Classement des Catégories des EMPLOYER</h3>
            <AgGridReact
              rowData={categoryEmployerStats}
              columnDefs={categoryColumnDefs}
              defaultColDef={{ sortable: true, filter: true }}
              domLayout="autoHeight"
              pagination={true}
              paginationPageSize={10}
            />
          </div>
          <div
            className="ag-theme-alpine"
            style={{
              width: "100%",
              marginTop: 30,
            }}
          >
            <h3>Nombre d'Utilisateurs Actifs</h3>
            <AgGridReact
              rowData={activeUserStats}
              columnDefs={activeUserColumnDefs}
              defaultColDef={{ sortable: true, filter: true }}
              domLayout="autoHeight"
              pagination={true}
              paginationPageSize={10}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Statistiques;
