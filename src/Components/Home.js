import React, { useState, useEffect } from "react";
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
import moment from "moment";
import search from "../search.png";
import reload from "../reload.png";
import noPhoto from "../no-photo.png";
import pushNotification from "../push-notification.png";
import Lottie from "react-lottie";
import * as animationData from "../loading.json";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setUsersData } from "../Store/usersSlice";
import { Modal, Button } from "react-bootstrap";
import axios from "axios";

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
const Home = () => {
  const client = createApolloClient();

  const usersData = useSelector((state) => state.users.usersData);
  const [users, setUsers] = useState(usersData);
  const [filteredUsers, setFilteredUsers] = useState(usersData);
  const [displayedUsers, setDisplayedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [gridApi, setGridApi] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loadingNotif, setLoadingNotif] = useState(false);
  const [notifSent, setNotifSent] = useState(false);
  const [notifTexte, setNotifTexte] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (usersData.length == 0) {
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
        setUsers(data.user);
        dispatch(setUsersData(data.user));
        setFilteredUsers(data.user);
      } catch (error) {
        console.error("Error fetching players data:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const onGridReady = (params) => {
    setGridApi(params.api);
  };

  const clearFilters = () => {
    gridApi?.setFilterModel(null);
  };

  const fetchDisplayedUsers = () => {
    if (!gridApi) return;

    const displayedRows = [];
    gridApi.forEachNodeAfterFilterAndSort((node) => {
      displayedRows.push(node.data);
    });
    // Ici, vous pouvez mettre à jour l'état avec les données récupérées
    setDisplayedUsers(displayedRows); // Ou faire autre chose avec les données
  };

  const columnDefs = [
    { field: "id", sortable: true, filter: true },
    { field: "type", sortable: true, filter: true, width: 90 },
    {
      field: "creationTime",
      headerName: "Création compte",
      sortable: true,
      sort: "desc",
      filter: true,
      width: 190,
      valueFormatter: (params) => {
        const date = moment(Number(params.value));
        // Vérifier si la date est valide
        if (date.isValid()) {
          const formattedDate = date.format("DD/MM/YYYY");
          return formattedDate;
        } else {
          // Retourner une chaîne vide si la date n'est pas valide
          return "";
        }
      },
    },
    {
      field: "sendinblue.lastConnection",
      headerName: "Dernière connection",
      sortable: true,
      filter: true,
      width: 190,
      valueFormatter: (params) => {
        const date = moment(Number(params.value));
        // Vérifier si la date est valide
        if (date.isValid()) {
          const formattedDate = date.format("DD/MM/YYYY");
          return formattedDate;
        } else {
          // Retourner une chaîne vide si la date n'est pas valide
          return "";
        }
      },
    },
    { field: "email", sortable: true, filter: true },
    {
      field: "picUrl",
      headerName: "Photo",
      width: 100,
      sortable: true,
      filter: true,
      cellRenderer: (props) => {
        return (
          <img
            src={props.value ? props.value : noPhoto}
            style={{ height: 35, width: 35, borderRadius: 70 }}
          />
        );
      },
    },
    {
      field: "firstName",
      headerName: "Prénom",
      width: 130,
      sortable: true,
      filter: true,
    },
    {
      field: "lastName",
      width: 130,
      headerName: "Nom",
      sortable: true,
      filter: true,
    },
    {
      field: "category",
      headerName: "Catégorie",
      width: 150,
      sortable: true,
      filter: true,
    },
    {
      field: "company.name",
      headerName: "Etablissement",
      width: 150,
      sortable: true,
      filter: true,
    },
    {
      field: "extra.job",
      headerName: "Job",
      width: 200,
      sortable: true,
      filter: true,
    },
    {
      field: "googlePlaceAddress",
      headerName: "Adresse",
      sortable: true,
      filter: true,
    },
    {
      field: "postalCode",
      headerName: "Code postal",
      sortable: true,
      filter: true,
    },
    {
      field: "city",
      headerName: "Ville",
      sortable: true,
      filter: true,
    },
    {
      field: "phoneNumber",
      headerName: "Téléphone",
      width: 150,
      sortable: true,
      filter: true,
    },
    {
      field: "isActiveSub",
      headerName: "Abonné",
      width: 110,
      sortable: true,
      filter: true,
    },
    {
      field: "isActivePurchase",
      headerName: "Achat unique",
      width: 140,
      sortable: true,
      filter: true,
    },
    {
      field: "sendinblue.os",
      width: 110,
      headerName: "Store",
      sortable: true,
      filter: true,
    },
    {
      field: "sendinblue.version",
      width: 130,
      headerName: "Version app",
      sortable: true,
      filter: true,
    },

    /*         { field: 'position', sortable: true, filter: true },
        { field: 'age', sortable: true, filter: true },
        { field: 'height', sortable: true, filter: true , valueFormatter: (params) => {
                return `${(params.value / 100).toFixed(2)}m`;
            }, },
        { field: 'foot', sortable: true, filter: true },
        { field: 'nationality', sortable: true, filter: true },
        { field: 'market_value', headerName: 'Market Value', sortable: true, filter: true, valueFormatter: (params) => {
                const value = params.value;
                if (value >= 1000000) {
                    // Check if it's an exact multiple of a million
                    if (value % 1000000 === 0) {
                        return `${value / 1000000}m`; // No decimal place if exact million
                    } else {
                        return `${(value / 1000000).toFixed(1)}m`; // One decimal place if not
                    }
                } else if (value >= 1000) {
                    // Check if it's an exact multiple of a thousand
                    if (value % 1000 === 0) {
                        return `${value / 1000}k`; // No decimal place if exact thousand
                    } else {
                        return `${(value / 1000).toFixed(1)}k`; // One decimal place if not
                    }
                } else {
                    // If value is less than 1000, just return it
                    return value.toString();
                }
            }
            },
        { field: 'club.name', headerName: 'Club', sortable: true, filter: true },
        { field: 'club.league.name', headerName: 'League', sortable: true, filter: true }, */
  ];

  const handleRowClick = (event) => {
    // Construire l'URL de la page de destination
    const url = `${window.location.origin}/user?uid=${event.data.id}`;

    // Ouvrir la nouvelle page dans un nouvel onglet
    window.open(url, "_blank");
  };

  const searchUsers = () => {
    setIsLoading(true);
    const filtered = users.filter(filterUsers);
    setFilteredUsers(filtered);
    setIsLoading(false);
  };

  const reloadUsers = () => {
    setIsLoading(true);
    setFilteredUsers(users);
    clearFilters();
    setSearchTerm("");
    gridApi.applyColumnState({
      state: [
        { colId: "creationTime", sort: "desc" }, // ou 'desc' pour un tri décroissant
      ],
      defaultState: { sort: null },
    });
    setIsLoading(false);
  };

  const openNotifModal = () => {
    fetchDisplayedUsers();
    setShowModal(true);
    setNotifSent(false);
    setNotifTexte("");
  };

  const sendNotif = async () => {
    setLoadingNotif(true);
    let usersIds = displayedUsers.map((x) => x.id);

    const { data } = await client.query({
      query: gql`
        query getTokens($userIds: [String!]) {
          tokens(where: { userId: { _in: $userIds } }) {
            id
            token
          }
        }
      `,
      variables: {
        userIds: usersIds,
      },
    });

    const tokens = data.tokens.map((x) => x.token);
    console.log("tokens", tokens);
    const payload = {
      data: {
        message: notifTexte,
        from: "admin",
        to: { tokens },
        type: "dashboard",
      },
    };

    try {
      await axios.post(
        "https://europe-west1-unextra-prod.cloudfunctions.net/sendNotificationV2",
        payload
      );
      setLoadingNotif(false);
      setNotifSent(true);
    } catch (error) {}
    setLoadingNotif(false);
  };

  const filterUsers = (user) => {
    const normalizeString = (str) =>
      str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

    const searchNormalized = normalizeString(searchTerm);

    if (
      user &&
      user.firstName &&
      user.lastName &&
      user.firstName &&
      user.email &&
      user.city
    ) {
      return user.company && user.company.name
        ? user.firstName.includes(searchNormalized) ||
            user.lastName.includes(searchNormalized) ||
            user.email.includes(searchNormalized) ||
            user.company.name.includes(searchNormalized)
        : user.firstName.includes(searchNormalized) ||
            user.lastName.includes(searchNormalized) ||
            user.email.includes(searchNormalized);
    }
  };

  return (
    <div className="container mt-5">
      <Navbar />
      <div
        style={{
          flexDirection: "row",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            flexDirection: "row",
            display: "flex",
            alignItems: "center",
          }}
        >
          <button
            onClick={reloadUsers}
            style={{
              borderRadius: 8,
              height: 55,
              width: 55,
              backgroundColor: "white",
              marginRight: 10,
            }}
          >
            <img src={reload} alt="Search" style={{ height: 30, width: 30 }} />
          </button>
          <input
            style={{ minWidth: 300, marginRight: 10 }}
            type="text"
            className="form-control search-input"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            onClick={searchUsers}
            style={{
              borderRadius: 8,
              height: 55,
              width: 55,
              backgroundColor: "white",
              marginRight: 10,
            }}
          >
            <img src={search} alt="Search" style={{ height: 30, width: 30 }} />
          </button>
          <button
            onClick={openNotifModal}
            style={{
              borderRadius: 8,
              height: 55,
              width: 55,
              backgroundColor: "white",
              marginRight: 10,
            }}
          >
            <img
              src={pushNotification}
              alt="Search"
              style={{ height: 30, width: 30 }}
            />
          </button>
        </div>
      </div>
      <div
        className="ag-theme-alpine"
        style={{ height: 600, width: "100%", marginTop: "20px" }}
      >
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
          <AgGridReact
            onGridReady={onGridReady}
            rowData={filteredUsers}
            columnDefs={columnDefs}
            domLayout="autoHeight"
            pagination={true}
            paginationPageSize={10}
            onRowClicked={handleRowClick} // Add this line
          ></AgGridReact>
        )}
      </div>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Envoyer une notification</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Cette notification sera envoyée à tous les utilisateurs filtrés (
          {`${displayedUsers.length}`})
          <div>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Entrez le texte ici..."
              maxLength="120"
              style={{ marginTop: "20px" }}
              value={notifTexte} // Liaison de l'état au champ de texte
              onChange={(e) => setNotifTexte(e.target.value)} // Mise à jour de l'état lors de la saisie
            ></textarea>
            <small
              style={{
                fontSize: 12,
                display: "block",
                textAlign: "right",
                marginTop: 5,
              }}
              className="text-muted"
            >
              Maximum 120 caractères.
            </small>
          </div>
        </Modal.Body>
        <Modal.Footer>
          {loadingNotif ? (
            <div className="text-center">
              <Lottie
                options={{
                  loop: true,
                  autoplay: true,
                  animationData: animationData,
                }}
                height={50}
                width={50}
              />
            </div>
          ) : notifSent ? (
            <div>Notification envoyée</div>
          ) : (
            <>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Annuler
              </Button>
              <Button
                style={{ backgroundColor: "#FDBB3B", borderColor: "#FDBB3B" }}
                onClick={sendNotif}
              >
                Envoyer
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Home;
