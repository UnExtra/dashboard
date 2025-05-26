import React, { useState, useEffect } from 'react';
import {getAllLeagues, getClubById, getClubsByLeagueId} from '../api'; // Adjusted API functions
import { useLocation } from 'react-router-dom';
import Navbar from "./Navbar";
import { AgGridReact } from 'ag-grid-react';

const LeagueDetail = () => {
    const { state } = useLocation();
    const league = state.league; // Assume this is passed via routing
    const [clubs, setClubs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lessValuableClub, setlLessValuableClub] = useState(null);
    const [mostValuableClub, setlMostValuableClub] = useState(null);

    useEffect(() => {
        fetchClubs();
    }, [league]);

    const fetchClubs = async () => {
        setIsLoading(true);
        const { lessValuableClubId, mostValuableClubId} = league;
        const lessValuableC = await getClubById(lessValuableClubId);
        const mostValuableC = await getClubById(mostValuableClubId);

        setlLessValuableClub(lessValuableC);
        setlMostValuableClub(mostValuableC);

        try {
            const clubsList = await getClubsByLeagueId(league.id);
            setClubs(clubsList);
        } catch (error) {
            console.error('Error fetching clubs data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const columnDefs = [
        { field: 'id', sortable: true, filter: true },
        { field: 'name', sortable: true, filter: true, headerName: 'Club Name' },
        { field: 'stadium_name', headerName: 'Stadium Name', sortable: true, filter: true },
        { field: 'stadium_seat', headerName: 'Stadium Seats', sortable: true, filter: true },
    ];
    const averageMarketValue = Math.round(league && league.avgMarketValue || 0);
    const formattedMarketValue = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(averageMarketValue);

    const averageLessValue = Math.round(lessValuableClub && lessValuableClub.avgmarketvalue || 0);
    const formattedAverageLessValue = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(averageLessValue);

    const averageMostValue = Math.round(mostValuableClub && mostValuableClub.avgmarketvalue || 0);
    const formattedAverageMostValue = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(averageMostValue);

    // Rounding the average stadium seats
    const roundedStadiumSeats = Math.round(league && league.avgStadiumSeats || 0);

    return (
        <div className="container mt-5">
            <Navbar/>
            {isLoading ? (
                    <div className="text-center">
                        <span>Loading clubs...</span>
                    </div>
                ) :
            <>
            <div className="row mb-3 justify-content-center">
                <div className="col-md-12">
                    <div className="container mt-4">
                        <div className="row justify-content-center">
                            <div className="col-md-6"> {/* Adjusted for the main content */}
                                <div className="text-center"> {/* Keep text-center for centering content */}
                                    <h3 className="mt-3 mt-md-0">{league.name}</h3>
                                    <p><strong>Continent:</strong> {league.continent}</p>
                                    <p><strong>Country:</strong> {league.country}</p>
                                    <p><strong>Average Market Value:</strong> {formattedMarketValue}</p>
                                    <p><strong>Average Stadium Seats:</strong> {roundedStadiumSeats.toLocaleString()}
                                    </p>
                                    <p><strong>Total Clubs:</strong> {league.totalClubs}</p>
                                    <p><strong>Total Players:</strong> {league.totalPlayers}</p>
                                </div>
                            </div>
                            <div className="col-md-6"> {/* New column for logos and values */}
                                <div className="row">
                                    <div className="col text-center">
                                        <p className="mt-3"><strong>Less valuable club</strong></p>
                                        <img src={lessValuableClub.image} className="img-fluid"
                                             alt="Less Valuable Club"/>
                                        <p className="mt-3"><strong>Value:</strong> {formattedAverageLessValue}</p>
                                    </div>
                                    <div className="col text-center">
                                        <p className="mt-3"><strong>Most valuable club</strong></p>
                                        <img src={mostValuableClub.image} className="img-fluid"
                                             alt="Most Valuable Club"/>
                                        <p className="mt-3"><strong>Value:</strong> {formattedAverageMostValue}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="ag-theme-alpine" style={{height: 600, width: '100%'}}>
                    <AgGridReact
                        rowData={clubs}
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

export default LeagueDetail;
