import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import noPhoto from "../no-photo.png";
import admin from "../admin.png";
import moment from "moment";
import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  split,
  gql,
} from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { WebSocketLink } from "@apollo/client/link/ws";
import { Dropdown, Button } from "react-bootstrap";
import Calendar from "react-calendar";
import * as animationData from "../loading.json";
import Lottie from "react-lottie";
import "react-calendar/dist/Calendar.css";
import { useSelector, useDispatch } from "react-redux";
import { setUsersData } from "../Store/usersSlice";

const { request } = require("graphql-request");

export const GRAPHQL_ENDPOINT = "https://unextra.hasura.app/v1/graphql";
export const GRAPHQL_SUBSCRIPTIONS = "wss://unextra.hasura.app/v1/graphql";
export const SECRET_KEY = "2tGF4WeLMIOsP/Q/h/VS2cd++EmJzMcb";
export const AUTH_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwczovL2hhc3VyYS5pby9qd3QvY2xhaW1zIjp7IngtaGFzdXJhLWFsbG93ZWQtcm9sZXMiOlsiYW5vbnltb3VzIl0sIngtaGFzdXJhLWRlZmF1bHQtcm9sZSI6ImFub255bW91cyJ9fQ.HM2vL95bDWL2xTMwCXXDatxlfLMd_8-Mx1ymyMiCKb4";

const INSERT_PURCHASE = gql`
  mutation insert_purchase(
    $userId: String
    $type: String
    $store: String
    $limit: bigint
  ) {
    insert_purchases(
      objects: { userId: $userId, type: $type, store: $store, limit: $limit }
    ) {
      affected_rows
    }
  }
`;

const UPDATE_PURCHASE = gql`
  mutation update_purchase(
    $userId: String
    $type: String
    $store: String
    $limit: bigint
  ) {
    update_purchases(
      where: { userId: { _eq: $userId } }
      _set: { limit: $limit, store: $store, type: $type }
    ) {
      affected_rows
    }
  }
`;

const TOGGLE_ACTIVE = gql`
  mutation MyMutation($isActive: Boolean, $userId: String) {
    update_user(
      where: { id: { _eq: $userId } }
      _set: { isActive: $isActive }
    ) {
      affected_rows
    }
  }
`;

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

const User = () => {
  const [isLoading, setIsLoading] = useState(true);
  const usersData = useSelector((state) => state.users.usersData);

  const [conversations, setConversations] = useState([]);
  const [offers, setOffers] = useState([]);
  const [missions, setMissions] = useState([]);
  const [storeVersion, setStoreVersion] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [selectedMission, setSelectedMission] = useState(null);

  const [activated, setActivated] = useState(false);
  const [value, onChange] = useState(new Date());
  const dispatch = useDispatch();

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  //const { state } = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);

    const uid = queryParams.get("uid");

    try {
      const client = createApolloClient();

      const { data } = await client.query({
        query: gql`
          query GetInfos($idUser: String, $idCompany: String) {
            user(where: { id: { _eq: $idUser } }) {
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
              missions {
                active
                address
                category
                city
                postalCode
                createdBy
                datePublication
                dateStart
                description
                googlePlaceAddress
                hours
                housed
                id
                idCompany
                idUser
                isPending
                isValidate
                isValidateByCompany
                isValidateByExtra
                job
                latitude
                longitude
                postalCode
                priceHour
                publicationDuration
              }
              offers {
                active
                address
                category
                city
                contractType
                createdBy
                dateEnd
                dateStart
                description
                googlePlaceAddress
                hoursPerWeek
                housed
                salary
                publicationDate
                postalCode
                longitude
                latitude
                job
                id
                idCompany
                isValidate
                availability {
                  fridayDay
                  fridayEvening
                  fridayNight
                  id
                  mondayDay
                  mondayEvening
                  mondayNight
                  saturdayDay
                  saturdayEvening
                  saturdayNight
                  sundayDay
                  sundayEvening
                  sundayNight
                  thursdayDay
                  thursdayEvening
                  thursdayNight
                  tuesdayDay
                  tuesdayEvening
                  tuesdayNight
                  wednesdayDay
                  wednesdayEvening
                  wednesdayNight
                }
              }
            }
            conversation(
              where: { _or: [{ idCompany: { _eq: $idCompany } }] }
              order_by: { lastMessage: desc_nulls_last }
            ) {
              id
              user {
                category
                firstName
                lastName
                picUrl
                ratings {
                  rate
                }
                company {
                  name
                }
              }
              userByIduser {
                firstName
                lastName
                picUrl
                ratings {
                  rate
                }
                extra {
                  job
                  isPro
                }
              }
              messages(order_by: { date: desc }) {
                text
                image
                from
                to
                date
                view
              }
            }
          }
        `,
        variables: {
          idUser: uid,
          idCompany: uid,
        },
      });

      const { data: store } = await client.query({
        query: gql`
          query GetVersionInfos {
            versionInfos {
              platform
              version
            }
          }
        `,
      });

      if (data.user && data.user[0]) {
        setUser(data.user[0]);
      }

      if (data.user && data.user[0] && data.user[0].sendinblue.os) {
        if (data.user[0].sendinblue) {
          const storeV = store.versionInfos.filter(
            (x) => x.platform == data.user[0].sendinblue.os
          );
          setStoreVersion(storeV[0].version);
        }

        if (data.user[0].missions) {
          setMissions(data.user[0].missions);
        }
        if (data.user[0].offers) {
          setOffers(data.user[0].offers);
        }
      }

      setConversations(data.conversation);
    } catch (error) {
      console.error("Error fetching players data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOfferSelected = (offer) => {
    setSelectedOffer(offer);
    setSelectedMission(null);
  };

  const handleMissionSelected = (mission) => {
    setSelectedMission(mission);
    setSelectedOffer(null);
  };

  const activateUser = async (uid) => {
    setIsLoading(true);
    const client = createApolloClient();

    const indexRedux = usersData.findIndex((x) => x.id == user.id);

    const limit = new Date(value).getTime();

    const resultActive = await client.mutate({
      mutation: TOGGLE_ACTIVE,
      variables: {
        userId: uid,
        isActive: true,
      },
    });

    if (
      !resultActive ||
      (resultActive?.data.insert_purchases?.affected_rows &&
        resultActive.data.insert_purchases.affected_rows != 1)
    ) {
      setIsLoading(false);
      return;
    }

    const { data } = await client.query({
      query: gql`
        query GetUserPurchases($uid: String!) {
          user_by_pk(id: $uid) {
            id
            purchases {
              limit
              creationTime
              id
              store
              type
            }
          }
        }
      `,
      variables: {
        uid,
      },
    });

    const purchase =
      data.user_by_pk.purchases && data.user_by_pk.purchases.length > 0;

    let result = null;
    if (purchase) {
      result = await client.mutate({
        mutation: UPDATE_PURCHASE,
        variables: {
          userId: uid,
          type: "free",
          store: "dashboard",
          limit,
        },
      });
    } else {
      result = await client.mutate({
        mutation: INSERT_PURCHASE,
        variables: {
          userId: uid,
          type: "free",
          store: "dashboard",
          limit,
        },
      });
    }

    if (
      result &&
      (result?.data.insert_purchases?.affected_rows == 1 ||
        result?.data.update_purchases?.affected_rows == 1)
    ) {
      setActivated(true);
      const newUser = { ...user, isActive: true };
      setUser(newUser);
      if (indexRedux != -1) {
        const newUsersData = [...usersData];
        newUsersData[indexRedux] = newUser;
        dispatch(setUsersData(newUsersData));
      }
      setIsLoading(false);
    } else {
      console.log("Erreur");
      setIsLoading(false);
    }
  };

  const handleConversationSelected = (conversation) => {
    setSelectedConversation(conversation);
  };

  return (
    <div className="container mt-5" style={{ paddingBottom: 100 }}>
      <Navbar detail={true} />
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
          <div className="row">
            <div className="col-md-4">
              <img
                src={user.picUrl ? user.picUrl : noPhoto}
                alt="Profile"
                className="img-fluid rounded-circle"
                style={{ height: 300, width: 300, marginTop: 30 }}
              />
            </div>
            <div className="col-md-8 mt-3">
              {user.company && user.company.name && (
                <h3>{user.company.name}</h3>
              )}
              <h3>
                {user.firstName} {user.lastName}{" "}
                {user.admin && (
                  <img
                    src={admin}
                    alt="admin"
                    className="img-fluid rounded-circle"
                    style={{ height: 40, width: 40 }}
                  />
                )}
              </h3>
              <div className="row">
                <div className="col-md-6">
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item">{user.email}</li>
                    <li className="list-group-item">{user.phoneNumber}</li>
                    <li className="list-group-item">
                      Abonné : {user.isActive ? "Oui" : "Non"}
                    </li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item">Type : {user.type}</li>
                    <li className="list-group-item">
                      Catégorie : {user.category}
                    </li>
                    {user.extra && (
                      <li className="list-group-item">
                        Job : {user.extra.job}
                      </li>
                    )}
                  </ul>
                </div>
              </div>
              <ul className="list-group list-group-flush mt-3">
                <li className="list-group-item">
                  Adresse: {user.googlePlaceAddress}
                </li>
                <li className="list-group-item">
                  OS: {user.sendinblue ? user.sendinblue.os : "Inconnu"},
                  Version:{" "}
                  {user.sendinblue ? user.sendinblue.version : "Inconnu"}
                  {` (${
                    storeVersion == user.sendinblue.version
                      ? "à jour"
                      : "pas à jour"
                  } : ${storeVersion})`}
                </li>
                <li className="list-group-item">
                  Compte créé le :{" "}
                  {moment(Number(user.creationTime)).format("DD/MM/YYYY")}
                </li>
                <li className="list-group-item">
                  Dernière connexion :{" "}
                  {user.sendinblue
                    ? moment(Number(user.sendinblue.lastConnection)).format(
                        "DD/MM/YYYY"
                      )
                    : "Inconnu"}
                </li>
              </ul>
            </div>
          </div>
          <React.Fragment>
            <h3 style={{ marginTop: 30 }}>
              <span className="badge text-bg-secondary">
                Conversations de cet utilisateur ({conversations.length})
              </span>
            </h3>
            <div style={{ textAlign: "left", marginTop: "20px" }}>
              {conversations.length > 0 ? (
                <Dropdown>
                  <Dropdown.Toggle
                    id="dropdown-basic"
                    style={{
                      backgroundColor: "#FDBB3B",
                      borderColor: "#FDBB3B",
                      color: "white",
                    }}
                    // Pour éviter que le bouton ne change de couleur lors du survol ou du focus, ajoutez :
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = "#FDBB3B")
                    }
                    onFocus={(e) =>
                      (e.currentTarget.style.backgroundColor = "#FDBB3B")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "#FDBB3B")
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.backgroundColor = "#FDBB3B")
                    }
                  >
                    Choisissez une conversation
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    {conversations.map(
                      (conversation) =>
                        conversation.messages.length > 0 && (
                          <Dropdown.Item
                            key={conversation.id}
                            onClick={() =>
                              handleConversationSelected(conversation)
                            }
                          >
                            Conversation avec{" "}
                            {conversation.userByIduser.firstName}{" "}
                            {conversation.userByIduser.lastName}
                          </Dropdown.Item>
                        )
                    )}
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <Button
                  variant="secondary"
                  style={{
                    backgroundColor: "#FDBB3B",
                    border: "none",
                    cursor: "default",
                  }}
                >
                  Cet utilisateur n'a aucune conversation
                </Button>
              )}
            </div>
            {selectedConversation && (
              <div
                className="mt-3 p-3"
                style={{
                  maxHeight: "400px",
                  overflowY: "auto",
                  background: "#f8f9fa",
                  border: "1px solid #dee2e6",
                  borderRadius: "0.25rem",
                }}
              >
                <h3>
                  Détails de la conversation avec{" "}
                  {selectedConversation.userByIduser.firstName}{" "}
                  {selectedConversation.userByIduser.lastName}
                </h3>
                {selectedConversation.messages.map((message, index) => {
                  // Déterminez si le message vient de l'utilisateur actuel
                  const isCurrentUserMessage = message.from === user.id;

                  // Obtenez le nom complet en fonction de l'expéditeur du message
                  const senderName = isCurrentUserMessage
                    ? `${user.firstName} ${user.lastName}` // Nom de l'utilisateur actuel
                    : `${selectedConversation.userByIduser.firstName} ${selectedConversation.userByIduser.lastName}`; // Nom de l'autre utilisateur

                  return (
                    <div
                      key={index}
                      className="mb-2"
                      style={{
                        background: "#e9ecef",
                        padding: "10px",
                        borderRadius: "0.25rem",
                      }}
                    >
                      <strong>{senderName}:</strong>
                      <p>{message.text}</p>
                      {/* Ajoutez d'autres détails du message si nécessaire */}
                    </div>
                  );
                })}
              </div>
            )}
            {user.type == "EMPLOYER" && (
              <React.Fragment>
                <h3 style={{ marginTop: 30 }}>
                  <span className="badge text-bg-secondary">
                    Annonces de cet utilisateur (
                    {offers.length + missions.length})
                  </span>
                </h3>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "20px",
                  }}
                >
                  {/* Dropdown pour les Missions */}
                  <Dropdown>
                    <Dropdown.Toggle
                      id="dropdown-missions"
                      style={{
                        backgroundColor: "#FDBB3B",
                        borderColor: "#FDBB3B",
                        color: "white",
                      }}
                    >
                      Choisissez une mission
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      {missions.length > 0 ? (
                        missions
                          .slice() // Créez une copie du tableau pour ne pas modifier le tableau original
                          .sort(
                            (a, b) =>
                              new Date(b.datePublication) -
                              new Date(a.datePublication)
                          )
                          .map((mission, index) => (
                            <Dropdown.Item
                              key={index}
                              onClick={() => handleMissionSelected(mission)}
                            >
                              Mission: {mission.job} -{" "}
                              {new Date(
                                mission.datePublication
                              ).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })}
                            </Dropdown.Item>
                          ))
                      ) : (
                        <Dropdown.Item>
                          Pas de missions actuellement
                        </Dropdown.Item>
                      )}
                    </Dropdown.Menu>
                  </Dropdown>

                  {/* Dropdown pour les Offres */}
                  <Dropdown>
                    <Dropdown.Toggle
                      id="dropdown-offers"
                      style={{
                        backgroundColor: "#FDBB3B",
                        borderColor: "#FDBB3B",
                        color: "white",
                      }}
                    >
                      Choisissez une offre
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      {offers.length > 0 ? (
                        offers
                          .slice() // Créez une copie du tableau pour ne pas modifier le tableau original
                          .sort(
                            (a, b) =>
                              new Date(b.publicationDate) -
                              new Date(a.publicationDate)
                          )
                          .map((offer, index) => (
                            <Dropdown.Item
                              key={index}
                              onClick={() => handleOfferSelected(offer)}
                            >
                              Offre: {offer.job} -{" "}
                              {new Date(
                                offer.publicationDate
                              ).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })}
                            </Dropdown.Item>
                          ))
                      ) : (
                        <Dropdown.Item>Pas d'offres actuellement</Dropdown.Item>
                      )}
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
                {selectedOffer && (
                  <div
                    className="mt-3 p-3"
                    style={{
                      background: "#f8f9fa",
                      border: "1px solid #dee2e6",
                      borderRadius: "0.25rem",
                      overflowY: "auto",
                      maxHeight: "400px",
                    }}
                  >
                    <h3>Détails de l'offre</h3>
                    <p>
                      <strong>Job:</strong> {selectedOffer.job}
                    </p>
                    <p>
                      <strong>Catégorie:</strong> {selectedOffer.category}
                    </p>
                    <p>
                      <strong>Ville:</strong> {selectedOffer.city}
                    </p>
                    <p>
                      <strong>Salaire:</strong> {selectedOffer.salary}€/mois
                    </p>
                    <p>
                      <strong>Date de début:</strong>{" "}
                      {new Date(selectedOffer.dateStart).toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        }
                      )}
                    </p>
                    <p>
                      <strong>Logé:</strong>{" "}
                      {selectedOffer.housed ? "Oui" : "Non"}
                    </p>
                  </div>
                )}
                {selectedMission && (
                  <div
                    className="mt-3 p-3"
                    style={{
                      background: "#f8f9fa",
                      border: "1px solid #dee2e6",
                      borderRadius: "0.25rem",
                      overflowY: "auto",
                      maxHeight: "400px",
                    }}
                  >
                    <h3>Détails de la mission</h3>
                    <p>
                      <strong>Job:</strong> {selectedMission.job}
                    </p>
                    <p>
                      <strong>Catégorie:</strong> {selectedMission.category}
                    </p>
                    <p>
                      <strong>Ville:</strong> {selectedMission.city}
                    </p>
                    <p>
                      <strong>Heures:</strong> {selectedMission.hours}H
                    </p>
                    <p>
                      <strong>Taux horaire:</strong> {selectedMission.priceHour}
                      €/H
                    </p>
                    <p>
                      <strong>Date de début:</strong>{" "}
                      {new Date(selectedMission.dateStart).toLocaleDateString(
                        "en-GB",
                        { day: "2-digit", month: "2-digit", year: "numeric" }
                      )}
                    </p>
                    <p>
                      <strong>Logé:</strong>{" "}
                      {selectedMission.housed ? "Oui" : "Non"}
                    </p>
                  </div>
                )}
              </React.Fragment>
            )}
            <h3 style={{ marginTop: 30 }}>
              <span className="badge text-bg-secondary">
                Actions pour cet utilisateur
              </span>
            </h3>
            {(!user.isActive || activated) && (
              <div
                style={{
                  display: "flex",
                  flex: 1,
                  alignItems: "flex-start",
                  flexDirection: "column",
                  overflowY: "scroll",
                  marginTop: 30,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {activated ? (
                    <div
                      style={{
                        fontSize: 16,
                        justifyContent: "center",
                        display: "flex",
                        marginBottom: 10,
                      }}
                    >
                      <b>Cet employeur est bien passé actif</b>
                    </div>
                  ) : (
                    <div>
                      <div
                        style={{
                          fontSize: 16,
                          justifyContent: "center",
                          display: "flex",
                          marginBottom: 10,
                        }}
                      >
                        <b>Passer ce profil en abonné jusqu'au</b>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Calendar onChange={onChange} value={value} />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginTop: 10,
                        }}
                      >
                        <div
                          style={{
                            cursor: "pointer",
                            backgroundColor: "#FDBB3B",
                            borderRadius: 5,
                            padding: 5,
                            paddingLeft: 10,
                            paddingRight: 10,
                          }}
                          onClick={() => activateUser(user.id)}
                        >
                          <span style={{ color: "white" }}>Valider</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </React.Fragment>
        </>
      )}
    </div>
  );
};

export default User;
