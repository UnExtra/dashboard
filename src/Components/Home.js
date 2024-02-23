import React, { useState, useEffect, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css'; // Core styles
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Theme
import {getImagePlayerIdExt, getPlayers} from '../api';
import Navbar from './Navbar';
import futImage from '../fut.png'; // Adjust the path as necessary

const Home = () => {
    const [players, setPlayers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    console.log('selectedPlayer', selectedPlayer);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const playersList = await getPlayers();
            console.log('PLAYER LIST', playersList);
            setPlayers(playersList);
        } catch (error) {
            console.error('Error fetching players data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedPlayer(null);
    }

    const columnDefs = [
        { field: 'name', sortable: true, filter: true },
        { field: 'position', sortable: true, filter: true },
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
        { field: 'club.league.name', headerName: 'League', sortable: true, filter: true },
    ];

    const handleRowClick = async (event) => {
        console.log('Player data', event.data);
        const imageUrl = await getImagePlayerIdExt(event.data.external_id)
        setSelectedPlayer({...event.data, imageUrl});
        setIsModalOpen(true);
    };

    const filterPlayers = (player) => {
        const normalizeString = (str) =>
            str
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase();

        const searchNormalized = normalizeString(searchTerm);
        return (
            normalizeString(player.name).includes(searchNormalized) ||
            normalizeString(player.position).includes(searchNormalized) ||
            (player.marketValue &&
                normalizeString(player.marketValue.toString()).includes(
                    searchNormalized
                ))
        );
    };

    let value = 0
    let height = 0
    if (selectedPlayer) {
        height = `${(selectedPlayer.height / 100).toFixed(2)}m`
        value = selectedPlayer.market_value;
        if (value >= 1000000) {
            // Check if it's an exact multiple of a million
            if (value % 1000000 === 0) {
                value = `${value / 1000000}m`; // No decimal place if exact million
            } else {
                value = `${(value / 1000000).toFixed(1)}m`; // One decimal place if not
            }
        } else if (value >= 1000) {
            // Check if it's an exact multiple of a thousand
            if (value % 1000 === 0) {
                value = `${value / 1000}k`; // No decimal place if exact thousand
            } else {
                value = `${(value / 1000).toFixed(1)}k`; // One decimal place if not
            }
        } else {
            // If value is less than 1000, just return it
            value = value.toString();
        }
    }

    const filteredPlayers = players.filter(filterPlayers);

    return (
        <div className="container mt-5">
            <Navbar/>
            <div className="row mb-3 justify-content-center">
                <div className="col-md-6">
                    <input
                        type="text"
                        className="form-control search-input"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <div className="ag-theme-alpine" style={{height: 600, width: '100%', marginTop: '20px'}}>
                {isLoading ? (
                    <div className="text-center">
                        <span className="spinner-custom" role="status">⚽</span>
                    </div>

                ) : (
                    <AgGridReact
                        rowData={filteredPlayers}
                        columnDefs={columnDefs}
                        domLayout='autoHeight'
                        pagination={true}
                        paginationPageSize={10}
                        onRowClicked={handleRowClick} // Add this line
                    ></AgGridReact>
                )}
            </div>
            {isModalOpen && (
                <div
                    className="modal"
                    style={{display: isModalOpen ? 'block' : 'none'}}
                    tabIndex="-1"
                    onClick={closeModal}
                >
                    <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="fut-modal-background" style={{backgroundImage: `url(${futImage})`}}>
                            <div className="modal-body">
                                <div className="player-details-overlay">
                                        <div className={'photo'}>
                                            <img src={selectedPlayer.imageUrl} alt={selectedPlayer.name}
                                                 style={{width: '300px', height: '300px', borderRadius: '50px', marginTop: "30px"}}/>
                                        </div>
                                    <div className={'details'}>
                                        <div className={'name'}>
                                        <h2>{selectedPlayer.name}</h2>
                                        </div>
                                        <div className={'other'}>
                                            <div>
                                                <p>{selectedPlayer.nationality}</p>
                                                <p>{selectedPlayer.position}</p>
                                            </div>
                                            <div>
                                                <p>{selectedPlayer.age} 🎂</p>
                                                <p>{height}</p>
                                            </div>
                                            <div>
                                                <p>{selectedPlayer.foot}🦶</p>
                                                <p>{value}💰</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
