import React, { useState, useEffect } from 'react';
import {getAllClubs, getClubDetails, getPlayerById, getPlayersByClubId} from '../api'; // Assume you have this function to fetch club details
import { useLocation } from 'react-router-dom';
import Navbar from "./Navbar";
import { AgGridReact } from 'ag-grid-react';
import futImage from '../fut.png'; // Adjust the path as necessary

const ClubDetail = () => {
    const {state} = useLocation();
    const club = state.club;
    const [players, setPlayers] = useState(null);
    const [mvp, setMvp] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [club]);

    const fetchData = async () => {
        setIsLoading(true);
        const { mostValuablePlayerId } = club;
        const mvp = await getPlayerById(mostValuablePlayerId);
        console.log('MVP', mvp);
        setMvp(mvp);
        try {
            const list = await getPlayersByClubId(club.id);
            setPlayers(list);
        } catch (error) {
            console.error('Error fetching players data:', error);
        } finally {
            setIsLoading(false);
        }
    };

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

    const averageMarketValue = club.avgmarketvalue || 0; // Example value
    const roundedValue = Math.round(averageMarketValue); // Round to nearest integer

// Format the number as a currency
    const formattedValue = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        // To display as an integer, we ensure the minimum and maximum fraction digits are set to 0
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(roundedValue);

    const mvpValue = mvp && mvp.market_value || 0;
    const roundedMvpValue = Math.round(mvpValue);

// Format the number as a currency
    const formattedMvpValue = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        // To display as an integer, we ensure the minimum and maximum fraction digits are set to 0
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(roundedMvpValue);

    return (
        <div className="container mt-5">
            <Navbar/>
            {isLoading ?
                <div className="text-center" style={{marginTop: '50px'}}>
                    <span className="spinner-custom" role="status">⚽</span>
                </div>
                :
                <>
                    <div className="row mb-3 justify-content-center">
                        <div className="col-md-12"> {/* Use the full width for the outer column */}
                            <div className="container mt-4">
                                <div className="row justify-content-center">
                                    <div className="col-md-9">
                                        <div
                                            className="row justify-content-around align-items-center"> {/* Use justify-content-around for equal spacing */}
                                            <div
                                                className="col-md-3 text-center"> {/* Adjusted size for the club image */}
                                                <img src={club.image} className="img-fluid" alt={club.name}
                                                     style={{maxWidth: '100%', height: 'auto'}}/>
                                            </div>
                                            <div className="col-md-6"> {/* Central column for details */}
                                                <h3 className="mt-3 mt-md-0">{club.name}</h3>
                                                <p><strong>Stadium:</strong> {club.stadium_name} -
                                                    Seats: {club.stadium_seat}
                                                </p>
                                                <p><strong>Average Market Value:</strong> {formattedValue}</p>
                                                <p><strong>Total Players:</strong> {club.totalplayers}</p>
                                                <p><strong>Forwards:</strong> {club.forwards}</p>
                                                <p><strong>Midfields:</strong> {club.midfields}</p>
                                                <p><strong>Backs:</strong> {club.backs}</p>
                                                <p><strong>Goalkeepers:</strong> {club.goalkeepers}</p>
                                            </div>
                                            {mvp && <div
                                                className="col-md-3 position-relative"
                                                style={{}}> {/* Make this a relative container for absolute positioning */}
                                                <img src={futImage} className="img-fluid" alt="FUT Image"
                                                     style={{width: '300px', height: 'auto'}}/>
                                                {/* Superimposed elements */}
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '10px',
                                                    left: '0px',
                                                    color: 'white',
                                                    width: '100%'
                                                }}>
                                                    {/* Example content */}
                                                    <div className={'photo'}>
                                                        <img src={mvp.imageUrl} alt={mvp.name}
                                                             style={{
                                                                 width: '150px',
                                                                 height: '150px',
                                                                 borderRadius: '20px',
                                                                 marginTop: "30px"
                                                             }}/>
                                                    </div>
                                                    <div>
                                                        <p style={{fontSize: '20px', fontWeight: 'bold'}}>MVP</p>
                                                        <p style={{fontSize: '18px', fontWeight: 'bold'}}>{mvp.name}</p>
                                                        <p style={{
                                                            fontSize: '16px',
                                                            fontWeight: 'bold'
                                                        }}>{formattedMvpValue}</p>
                                                    </div>
                                                </div>
                                            </div>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="ag-theme-alpine" style={{height: 600, width: '100%', marginTop: '20px'}}>
                        <AgGridReact
                            rowData={players}
                            columnDefs={columnDefs}
                            domLayout='autoHeight'
                            pagination={true}
                            paginationPageSize={10}
                        ></AgGridReact>
                    </div>
                </>}
        </div>
    );
};

export default ClubDetail;
