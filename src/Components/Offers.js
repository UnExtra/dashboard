import React, { useState, useMemo, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css"; // Core styles
import "ag-grid-community/styles/ag-theme-alpine.css"; // Theme
import Navbar from "./Navbar";
import { getMainDefinition } from "@apollo/client/utilities";
import { WebSocketLink } from "@apollo/client/link/ws";
import { useSelector } from "react-redux";
import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  split,
  gql,
} from "@apollo/client";
import Lottie from "react-lottie";
import * as animationData from "../loading.json";
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

const Offers = () => {
  const usersData = useSelector((state) => state.users.usersData);
  const [rowData, setRowData] = useState([]);
  const [offers, setOffers] = useState([]);
  const [missions, setMissions] = useState([]);
  const [isLoading, setIsLoading] = useState([]);
  const [jobStats, setJobStats] = useState([]);
  const [categoryEmployerStats, setCategoryEmployerStats] = useState([]);
  const [activeUserStats, setActiveUserStats] = useState([]);
  const client = createApolloClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data } = await client.query({
        query: gql`
          query {
            offer {
              id
              active
              address
              category
              city
              contractType
              dateEnd
              dateStart
              description
              googlePlaceAddress
              hoursPerWeek
              housed
              salary
              job
              publicationDate
              user {
                company {
                  name
                  id
                }
              }
            }
          }
        `,
      });
      const sortedOffers = [...data.offer].sort(
        (a, b) => new Date(b.publicationDate) - new Date(a.publicationDate)
      );

      setOffers(sortedOffers);

      const { data: missionsData } = await client.query({
        query: gql`
          query {
            mission {
              active
              address
              category
              city
              datePublication
              dateStart
              description
              googlePlaceAddress
              hours
              housed
              job
              user {
                company {
                  name
                  id
                }
              }
            }
          }
        `,
      });

      const sortedMissions = [...missionsData.mission].sort(
        (a, b) => new Date(b.datePublication) - new Date(a.datePublication)
      );

      setMissions(sortedMissions);
    } catch (error) {
      console.error("Error fetching players data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const offerColumnDefs = useMemo(
    () => [
      {
        headerName: "Date de Publication",
        field: "publicationDate",
        valueFormatter: (params) => new Date(params.value).toLocaleDateString(),
      },
      {
        headerName: "Annonce active",
        field: "active",
        cellRenderer: (params) => (params.value ? "Oui" : "Non"),
      },
      { headerName: "Adresse", field: "googlePlaceAddress" },
      { headerName: "Ville", field: "city" },
      { headerName: "Catégorie", field: "category" },
      { headerName: "Job", field: "job" },
      { headerName: "Type de Contrat", field: "contractType" },
      {
        headerName: "Date Début",
        field: "dateStart",
        valueFormatter: (params) => new Date(params.value).toLocaleDateString(),
      },
      {
        headerName: "Date Fin",
        field: "dateEnd",
        valueFormatter: (params) =>
          params.value ? new Date(params.value).toLocaleDateString() : "N/A",
      },
      { headerName: "Heures/Semaine", field: "hoursPerWeek" },
      {
        headerName: "Logé",
        field: "housed",
        cellRenderer: (params) => (params.value ? "Oui" : "Non"),
      },
      { headerName: "Salaire (€)", field: "salary" },
      { headerName: "Etablissement", field: "user.company.name" },
    ],
    []
  );

  const missionColumnDefs = useMemo(
    () => [
      {
        headerName: "Date de Publication",
        field: "datePublication",
        valueFormatter: (params) => new Date(params.value).toLocaleDateString(),
      },
      {
        headerName: "Mission active",
        field: "active",
        cellRenderer: (params) => (params.value ? "Oui" : "Non"),
      },
      { headerName: "Adresse", field: "googlePlaceAddress" },
      { headerName: "Ville", field: "city" },
      { headerName: "Catégorie", field: "category" },
      { headerName: "Job", field: "job" },
      {
        headerName: "Date Début",
        field: "dateStart",
        valueFormatter: (params) => new Date(params.value).toLocaleDateString(),
      },
      { headerName: "Heures", field: "hours" },
      {
        headerName: "Logé",
        field: "housed",
        cellRenderer: (params) => (params.value ? "Oui" : "Non"),
      },
      { headerName: "Etablissement", field: "user.company.name" },
    ],
    []
  );

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
            <h3>Offres d'Emploi</h3>
            <AgGridReact
              rowData={offers}
              columnDefs={offerColumnDefs}
              defaultColDef={{ sortable: true, filter: true }}
              domLayout="autoHeight"
              pagination={true}
              paginationPageSize={10}
            />
          </div>
          <div
            className="ag-theme-alpine"
            style={{ width: "100%", marginTop: 30 }}
          >
            <h3>Missions</h3>
            <AgGridReact
              rowData={missions}
              columnDefs={missionColumnDefs}
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

export default Offers;
