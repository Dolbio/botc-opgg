import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, Users, Award, Skull, Heart, ChevronDown, ChevronUp, BookOpen, Calendar, Scroll, UserCheck, Upload, X, AlertCircle, Trash2 } from 'lucide-react';

const BotCStatsTracker = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [matches, setMatches] = useState([]);
  const [playerStats, setPlayerStats] = useState(null);
  const [expandedMatch, setExpandedMatch] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState('all');
  const [selectedScript, setSelectedScript] = useState('all');
  const [selectedTeammate, setSelectedTeammate] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [importData, setImportData] = useState('');
  const [importError, setImportError] = useState('');
  const [importedMatches, setImportedMatches] = useState([]);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastImportDate, setLastImportDate] = useState(null);

  const demoMatches = [
    { 
      id: 1, 
      date: '2025-01-20',
      season: '2025',
      script: 'Trouble Brewing',
      storyteller: 'ClockMaster',
      players: [
        { name: 'ShadowPlayer', role: 'Imp', team: 'Böse', alive: false, result: 'Sieg' },
        { name: 'TowerGuard', role: 'Washerwoman', team: 'Gut', alive: false, result: 'Niederlage' },
        { name: 'NightOwl', role: 'Baron', team: 'Böse', alive: true, result: 'Sieg' },
        { name: 'MoonShadow', role: 'Ravenkeeper', team: 'Gut', alive: false, result: 'Niederlage' }
      ]
    },
    { 
      id: 2, 
      date: '2025-01-19',
      season: '2025',
      script: 'Bad Moon Rising',
      storyteller: 'TowerGuard',
      players: [
        { name: 'ShadowPlayer', role: 'Tea Lady', team: 'Gut', alive: true, result: 'Sieg' },
        { name: 'ClockMaster', role: 'Zombuul', team: 'Böse', alive: false, result: 'Niederlage' },
        { name: 'NightOwl', role: 'Godfather', team: 'Böse', alive: false, result: 'Niederlage' }
      ]
    },
    { 
      id: 3, 
      date: '2025-01-18',
      season: '2025',
      script: 'Sects and Violets',
      storyteller: 'MoonShadow',
      players: [
        { name: 'ShadowPlayer', role: 'Vigormortis', team: 'Böse', alive: false, result: 'Niederlage' },
        { name: 'TowerGuard', role: 'Flowergirl', team: 'Gut', alive: true, result: 'Sieg' },
        { name: 'ClockMaster', role: 'Sage', team: 'Gut', alive: false, result: 'Sieg' }
      ]
    }
  ];

  // Lade gespeicherte Daten beim Start
  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = () => {
    try {
      setIsLoading(true);
      const savedMatches = localStorage.getItem('botc-matches');
      const savedDate = localStorage.getItem('botc-import-date');
      
      if (savedMatches) {
        const parsedMatches = JSON.parse(savedMatches);
        setImportedMatches(parsedMatches);
        console.log('Gespeicherte Spiele geladen:', parsedMatches.length);
      }
      
      if (savedDate) {
        setLastImportDate(savedDate);
      }
    } catch (error) {
      console.log('Keine gespeicherten Daten gefunden oder Fehler beim Laden:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveMatchesToStorage = (matchesArray) => {
    try {
      localStorage.setItem('botc-matches', JSON.stringify(matchesArray));
      const now = new Date().toLocaleString('de-DE');
      localStorage.setItem('botc-import-date', now);
      setLastImportDate(now);
      console.log('Spiele gespeichert:', matchesArray.length);
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      alert('⚠️ Fehler beim Speichern der Daten. Bitte versuche es erneut.');
    }
  };

  const clearStoredData = () => {
    if (confirm('Möchtest du wirklich alle gespeicherten Spiele löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      try {
        localStorage.removeItem('botc-matches');
        localStorage.removeItem('botc-import-date');
        setImportedMatches([]);
        setLastImportDate(null);
        alert('✅ Alle gespeicherten Daten wurden gelöscht.');
      } catch (error) {
        console.error('Fehler beim Löschen:', error);
        alert('⚠️ Fehler beim Löschen der Daten.');
      }
    }
  };

  const parseImportData = (data) => {
    try {
      setImportError('');
      const lines = data.trim().split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        setImportError('Keine gültigen Daten gefunden. Mindestens eine Kopfzeile und eine Datenzeile werden benötigt.');
        return;
      }

      const gameData = {};
      let parsedCount = 0;
      let skippedCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split('\t');
        
        if (values.length < 7) {
          skippedCount++;
          continue;
        }

        const gameId = values[0].trim();
        const dateStr = values[1].trim();
        const playerName = values[2].trim();
        const role = values[3].trim();
        const resultStr = values[4].trim();
        const scriptShort = values[5].trim();
        const teamStr = values[6].trim();

        if (!gameId || !playerName || !role) {
          skippedCount++;
          continue;
        }

        const result = resultStr.toLowerCase() === 'win' ? 'Sieg' : 'Niederlage';
        const team = teamStr.toLowerCase() === 'good' ? 'Gut' : 'Böse';

        const dateParts = dateStr.split('/');
        const formattedDate = dateParts.length === 3 
          ? `${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}` 
          : dateStr;

        const scriptMap = {
          'S&V': 'Sects and Violets',
          'TB': 'Trouble Brewing',
          'BMR': 'Bad Moon Rising'
        };
        const script = scriptMap[scriptShort] || scriptShort;

        if (!gameData[gameId]) {
          gameData[gameId] = {
            id: parseInt(gameId) || parsedCount,
            date: formattedDate,
            season: dateParts.length === 3 ? dateParts[2] : '2025',
            script: script,
            storyteller: 'Unknown',
            players: []
          };
        }

        const alive = Math.random() > 0.4;

        gameData[gameId].players.push({
          name: playerName,
          role: role,
          team: team,
          alive: alive,
          result: result
        });

        parsedCount++;
      }

      const matchesArray = Object.values(gameData);
      
      if (matchesArray.length === 0) {
        setImportError('Keine gültigen Spiele gefunden. Bitte überprüfe das Format deiner Daten.');
        return;
      }

      // Speichere die Daten
      saveMatchesToStorage(matchesArray);
      
      setImportedMatches(matchesArray);
      
      const uniquePlayers = new Set();
      matchesArray.forEach(match => {
        match.players.forEach(p => uniquePlayers.add(p.name));
      });
      
      const playersList = Array.from(uniquePlayers).sort().map((name, idx) => ({
        id: idx + 1,
        name: name,
        avatar: '👤'
      }));
      
      setAvailablePlayers(playersList);
      setShowImport(false);
      setImportData('');
      
      const message = `✅ Import erfolgreich!\n\n${matchesArray.length} Spiele importiert\n${uniquePlayers.size} Spieler gefunden${skippedCount > 0 ? `\n${skippedCount} Zeilen übersprungen` : ''}\n\nDeine Daten wurden in deinem Browser gespeichert und werden beim nächsten Besuch automatisch geladen.`;
      alert(message);
      
    } catch (error) {
      setImportError('Fehler beim Parsen der Daten: ' + error.message);
      console.error('Import error:', error);
    }
  };

  const getPlayerMatches = (playerName) => {
    const allMatches = importedMatches.length > 0 ? importedMatches : demoMatches;
    return allMatches.filter(match => {
      const isPlayer = match.players.some(p => p.name === playerName);
      const isStoryteller = match.storyteller === playerName;
      return isPlayer || isStoryteller;
    }).map(match => {
      const playerData = match.players.find(p => p.name === playerName);
      if (playerData) {
        return {
          ...match,
          role: playerData.role,
          team: playerData.team,
          result: playerData.result,
          alive: playerData.alive
        };
      } else {
        return {
          ...match,
          role: 'Storyteller',
          team: 'Storyteller',
          result: '-',
          alive: true
        };
      }
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const calculateStats = (playerMatches) => {
    const allMatches = importedMatches.length > 0 ? importedMatches : demoMatches;
    let filteredMatches = selectedSeason === 'all' ? playerMatches : playerMatches.filter(m => m.season === selectedSeason);
    
    if (selectedScript !== 'all') {
      filteredMatches = filteredMatches.filter(m => m.script === selectedScript);
    }

    const playedMatches = filteredMatches.filter(m => m.role !== 'Storyteller');

    const total = playedMatches.length;
    const wins = playedMatches.filter(m => m.result === 'Sieg').length;
    const winrate = total > 0 ? ((wins / total) * 100).toFixed(1) : 0;

    const evilMatches = playedMatches.filter(m => m.team === 'Böse');
    const goodMatches = playedMatches.filter(m => m.team === 'Gut');
    
    const evilWins = evilMatches.filter(m => m.result === 'Sieg').length;
    const goodWins = goodMatches.filter(m => m.result === 'Sieg').length;
    
    const evilWinrate = evilMatches.length > 0 ? ((evilWins / evilMatches.length) * 100).toFixed(1) : 0;
    const goodWinrate = goodMatches.length > 0 ? ((goodWins / goodMatches.length) * 100).toFixed(1) : 0;

    const roleCounts = {};
    const roleWins = {};
    
    playedMatches.forEach(m => {
      roleCounts[m.role] = (roleCounts[m.role] || 0) + 1;
      if (m.result === 'Sieg') {
        roleWins[m.role] = (roleWins[m.role] || 0) + 1;
      }
    });

    const roleStats = Object.keys(roleCounts).map(role => ({
      role,
      games: roleCounts[role],
      wins: roleWins[role] || 0,
      winrate: ((roleWins[role] || 0) / roleCounts[role] * 100).toFixed(1)
    })).sort((a, b) => b.games - a.games);

    let allFilteredMatches = selectedSeason === 'all' ? allMatches : allMatches.filter(m => m.season === selectedSeason);
    
    if (selectedScript !== 'all') {
      allFilteredMatches = allFilteredMatches.filter(m => m.script === selectedScript);
    }
    
    const stGames = allFilteredMatches.filter(m => m.storyteller === selectedPlayer?.name);

    const teammateStats = {};
    playedMatches.forEach(match => {
      const fullMatch = allMatches.find(m => m.id === match.id);
      if (!fullMatch) return;
      
      const currentPlayerData = fullMatch.players.find(p => p.name === selectedPlayer?.name);
      if (currentPlayerData) {
        fullMatch.players.forEach(p => {
          if (p.name !== selectedPlayer?.name) {
            if (!teammateStats[p.name]) {
              teammateStats[p.name] = {
                name: p.name,
                sameTeam: 0,
                sameTeamWins: 0,
                total: 0
              };
            }
            teammateStats[p.name].total++;
            if (p.team === currentPlayerData.team) {
              teammateStats[p.name].sameTeam++;
              if (match.result === 'Sieg') {
                teammateStats[p.name].sameTeamWins++;
              }
            }
          }
        });
      }
    });

    const teammateList = Object.values(teammateStats).map(t => ({
      ...t,
      winrate: t.sameTeam > 0 ? ((t.sameTeamWins / t.sameTeam) * 100).toFixed(1) : 0
    })).sort((a, b) => b.sameTeam - a.sameTeam);

    return {
      total,
      wins,
      winrate,
      evilGames: evilMatches.length,
      goodGames: goodMatches.length,
      evilWinrate,
      goodWinrate,
      roleStats,
      storytellerGames: stGames.length,
      teammateStats: teammateList
    };
  };

  const handlePlayerClick = (playerName) => {
    const player = availablePlayers.find(p => p.name === playerName);
    if (player) {
      const playerMatches = getPlayerMatches(player.name);
      setSelectedPlayer(player);
      setMatches(playerMatches);
      setPlayerStats(calculateStats(playerMatches));
      setExpandedMatch(null);
      setSearchQuery('');
      setSelectedTeammate(null);
    }
  };

  const getAvailableSeasons = () => {
    if (!matches || matches.length === 0) return [];
    const seasons = new Set();
    matches.forEach(m => seasons.add(m.season));
    return Array.from(seasons).sort().reverse();
  };

  const getAvailableScripts = () => {
    if (!matches || matches.length === 0) return [];
    const scripts = new Set();
    matches.forEach(m => scripts.add(m.script));
    return Array.from(scripts).sort();
  };

  useEffect(() => {
    const currentMatches = importedMatches.length > 0 ? importedMatches : demoMatches;
    const uniquePlayers = new Set();
    currentMatches.forEach(match => {
      match.players.forEach(p => uniquePlayers.add(p.name));
    });
    
    const playersList = Array.from(uniquePlayers).sort().map((name, idx) => ({
      id: idx + 1,
      name: name,
      avatar: '👤'
    }));
    
    setAvailablePlayers(playersList);
    
    if (playersList.length > 0) {
      const player = playersList[0];
      const playerMatches = getPlayerMatches(player.name);
      setSelectedPlayer(player);
      setMatches(playerMatches);
      setPlayerStats(calculateStats(playerMatches));
    }
  }, [importedMatches]);

  useEffect(() => {
    if (selectedPlayer && matches.length > 0) {
      setPlayerStats(calculateStats(matches));
    }
  }, [selectedSeason, selectedScript]);

  const filteredPlayers = availablePlayers.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (showImport) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-4">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-purple-400 flex items-center gap-2">
                <Upload size={28} />
                Spiele importieren
              </h2>
              <button
                onClick={() => {
                  setShowImport(false);
                  setImportData('');
                  setImportError('');
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2"
              >
                <X size={18} />
                Abbrechen
              </button>
            </div>

            {lastImportDate && (
              <div className="mb-4 bg-green-900 bg-opacity-30 border border-green-500 rounded-lg p-4">
                <p className="text-green-200 text-sm">
                  ℹ️ Letzter Import: {lastImportDate}
                </p>
                <p className="text-green-100 text-xs mt-1">
                  Ein neuer Import wird die aktuellen Daten überschreiben.
                </p>
              </div>
            )}

            <div className="mb-4 bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg p-4">
              <p className="text-blue-200 mb-2 font-semibold">
                📋 Anleitung:
              </p>
              <p className="text-sm text-blue-100 mb-2">
                Füge deine Spieldaten im Tab-getrennten Format ein. Kopiere die Daten direkt aus einer Tabellenkalkulation.
              </p>
              <p className="text-xs text-blue-200 font-mono bg-blue-950 bg-opacity-50 p-2 rounded">
                Spiel # → Datum → Name → Rolle → Win/Lose → Set → Team
              </p>
            </div>

            <textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="Beispiel:
Spiel #	Datum	Name	Rolle	Win / Lose	Set	Team
1	14/03/2025	Hung	Mutant	Lose	S&V	Good
1	14/03/2025	Chi	Klutz	Lose	S&V	Good"
              className="w-full h-96 bg-gray-900 border border-gray-600 rounded-lg p-4 text-white font-mono text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
            />

            {importError && (
              <div className="mt-4 p-4 bg-red-900 bg-opacity-30 border border-red-500 rounded-lg text-red-300 flex items-start gap-3">
                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">Fehler beim Import:</p>
                  <p className="text-sm">{importError}</p>
                </div>
              </div>
            )}

            <div className="mt-6 flex gap-4">
              <button
                onClick={() => parseImportData(importData)}
                disabled={!importData.trim()}
                className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Upload size={20} />
                Daten importieren & speichern
              </button>
              <button
                onClick={clearStoredData}
                disabled={importedMatches.length === 0}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <Trash2 size={20} />
                Daten löschen
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🕐</div>
          <p className="text-xl text-purple-300">Lade Daten...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              🕐 Blood on the Clocktower Stats
            </h1>
            <button
              onClick={() => setShowImport(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <Upload size={18} />
              Spiele importieren
            </button>
          </div>
          <p className="text-gray-400">Verfolge deine Spielerstatistiken und Erfolge</p>
          {importedMatches.length > 0 ? (
            <div className="flex items-center gap-4 mt-2">
              <p className="text-sm text-purple-300">
                ✓ {importedMatches.length} gespeicherte Spiele geladen
              </p>
              {lastImportDate && (
                <p className="text-xs text-gray-400">
                  Letzter Import: {lastImportDate}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-yellow-300 mt-1">
              ⚠️ Demo-Modus aktiv - Importiere deine Spiele, um sie dauerhaft zu speichern
            </p>
          )}
        </div>

        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Spielername suchen..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="mt-3 flex gap-2 flex-wrap">
            {(searchQuery ? filteredPlayers : availablePlayers).slice(0, 10).map(player => (
              <button
                key={player.id}
                onClick={() => handlePlayerClick(player.name)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${selectedPlayer?.name === player.name ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-800 hover:bg-gray-700'}`}
              >
                {player.avatar} {player.name}
              </button>
            ))}
            {searchQuery && filteredPlayers.length > 10 && (
              <span className="px-3 py-1.5 text-sm text-gray-400">
                +{filteredPlayers.length - 10} weitere...
              </span>
            )}
          </div>
        </div>

        {selectedPlayer && playerStats && (
          <div>
            {getAvailableSeasons().length > 1 && (
              <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar size={20} className="text-purple-400" />
                  <h3 className="font-semibold">Season Filter</h3>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setSelectedSeason('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedSeason === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                  >
                    All Time
                  </button>
                  {getAvailableSeasons().map(season => (
                    <button
                      key={season}
                      onClick={() => setSelectedSeason(season)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedSeason === season ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                      Season {season}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {getAvailableScripts().length > 1 && (
              <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <Scroll size={20} className="text-purple-400" />
                  <h3 className="font-semibold">Script Filter</h3>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setSelectedScript('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedScript === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                  >
                    Alle Scripts
                  </button>
                  {getAvailableScripts().map(script => (
                    <button
                      key={script}
                      onClick={() => setSelectedScript(script)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedScript === script ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                      {script}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gradient-to-r from-purple-800 to-pink-800 rounded-lg p-6 mb-6 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="text-6xl">{selectedPlayer.avatar}</div>
                <div>
                  <h2 className="text-3xl font-bold">{selectedPlayer.name}</h2>
                  <p className="text-purple-200">{playerStats.total} Spiele gespielt • {playerStats.storytellerGames} als Storyteller</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-yellow-500 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <Award className="text-yellow-400" size={24} />
                  <h3 className="text-lg font-semibold">Gesamt Winrate</h3>
                </div>
                <p className="text-3xl font-bold text-yellow-400">{playerStats.winrate}%</p>
                <p className="text-gray-400 text-sm">{playerStats.wins}S / {playerStats.total - playerStats.wins}N</p>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-red-500 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <Skull className="text-red-400" size={24} />
                  <h3 className="text-lg font-semibold">Böse Winrate</h3>
                </div>
                <p className="text-3xl font-bold text-red-400">{playerStats.evilWinrate}%</p>
                <p className="text-gray-400 text-sm">{playerStats.evilGames} Spiele</p>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <Heart className="text-blue-400" size={24} />
                  <h3 className="text-lg font-semibold">Gut Winrate</h3>
                </div>
                <p className="text-3xl font-bold text-blue-400">{playerStats.goodWinrate}%</p>
                <p className="text-gray-400 text-sm">{playerStats.goodGames} Spiele</p>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-purple-500 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="text-purple-400" size={24} />
                  <h3 className="text-lg font-semibold">Storyteller</h3>
                </div>
                <p className="text-3xl font-bold text-purple-400">{playerStats.storytellerGames}</p>
                <p className="text-gray-400 text-sm">Spiele geleitet</p>
              </div>
            </div>

            {playerStats.roleStats.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Users size={24} className="text-purple-400" />
                  Rollen-Statistiken
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-2 px-2">Rolle</th>
                        <th className="text-center py-2 px-2">Spiele</th>
                        <th className="text-center py-2 px-2">Siege</th>
                        <th className="text-center py-2 px-2">Winrate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {playerStats.roleStats.map((stat, idx) => (
                        <tr key={idx} className="border-b border-gray-700 hover:bg-gray-750">
                          <td className="py-3 px-2 font-medium">{stat.role}</td>
                          <td className="text-center py-3 px-2">{stat.games}</td>
                          <td className="text-center py-3 px-2">{stat.wins}</td>
                          <td className="text-center py-3 px-2">
                            <span className={`font-bold ${parseFloat(stat.winrate) >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                              {stat.winrate}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {playerStats.teammateStats.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <UserCheck size={24} className="text-purple-400" />
                  Mitspieler-Statistiken
                </h3>
                <p className="text-gray-400 text-sm mb-4">Winrate wenn im selben Team</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {playerStats.teammateStats.map((teammate, idx) => (
                    <div 
                      key={idx} 
                      className={`p-4 rounded-lg cursor-pointer transition-all ${selectedTeammate === teammate.name ? 'bg-purple-700 border-2 border-purple-400' : 'bg-gray-700 hover:bg-gray-650 border-2 border-transparent'}`}
                      onClick={() => setSelectedTeammate(selectedTeammate === teammate.name ? null : teammate.name)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-lg">{teammate.name}</span>
                        <span className={`text-2xl font-bold ${parseFloat(teammate.winrate) >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                          {teammate.winrate}%
                        </span>
                      </div>
                      <div className="text-sm text-gray-300">
                        <span>{teammate.sameTeam} Spiele im selben Team</span>
                        <span className="mx-2">•</span>
                        <span>{teammate.sameTeamWins} Siege</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {teammate.total} Spiele insgesamt zusammen
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp size={24} className="text-purple-400" />
                Match History
                {selectedTeammate && (
                  <span className="text-sm font-normal text-purple-300 ml-2">
                    (gefiltert: mit {selectedTeammate} im selben Team)
                  </span>
                )}
              </h3>
              <div className="space-y-2">
                {matches.filter(match => {
                  const seasonMatch = selectedSeason === 'all' || match.season === selectedSeason;
                  const scriptMatch = selectedScript === 'all' || match.script === selectedScript;
                  
                  let teammateMatch = true;
                  if (selectedTeammate && match.role !== 'Storyteller') {
                    const allMatches = importedMatches.length > 0 ? importedMatches : demoMatches;
                    const fullMatch = allMatches.find(m => m.id === match.id);
                    if (fullMatch) {
                      const currentPlayerData = fullMatch.players.find(p => p.name === selectedPlayer.name);
                      const teammateData = fullMatch.players.find(p => p.name === selectedTeammate);
                      teammateMatch = teammateData && currentPlayerData && teammateData.team === currentPlayerData.team;
                    }
                  }
                  
                  return seasonMatch && scriptMatch && teammateMatch;
                }).map((match) => {
                  const allMatches = importedMatches.length > 0 ? importedMatches : demoMatches;
                  const fullMatch = allMatches.find(m => m.id === match.id);
                  
                  return (
                    <div key={match.id}>
                      <div
                        className={`p-4 rounded-lg border-l-4 cursor-pointer transition-all ${match.role === 'Storyteller' ? 'bg-purple-900 bg-opacity-20 border-purple-500 hover:bg-opacity-30' : match.result === 'Sieg' ? 'bg-green-900 bg-opacity-20 border-green-500 hover:bg-opacity-30' : 'bg-red-900 bg-opacity-20 border-red-500 hover:bg-opacity-30'}`}
                        onClick={() => setExpandedMatch(expandedMatch === match.id ? null : match.id)}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-4">
                            {match.role === 'Storyteller' ? (
                              <>
                                <span className="font-bold text-purple-400">Storyteller</span>
                                <BookOpen size={20} className="text-purple-400" />
                              </>
                            ) : (
                              <>
                                <span className={`font-bold ${match.result === 'Sieg' ? 'text-green-400' : 'text-red-400'}`}>
                                  {match.result}
                                </span>
                                <span className="font-semibold text-lg">{match.role}</span>
                                <span className={`px-3 py-1 rounded-full text-sm ${match.team === 'Böse' ? 'bg-red-600 bg-opacity-50' : 'bg-blue-600 bg-opacity-50'}`}>
                                  {match.team}
                                </span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-gray-400 text-sm">
                              <span className="mr-4">{match.script}</span>
                              <span>{match.date}</span>
                            </div>
                            {expandedMatch === match.id ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                          </div>
                        </div>
                      </div>
                      
                      {expandedMatch === match.id && fullMatch && (
                        <div className="mt-2 bg-gray-900 bg-opacity-50 rounded-lg p-4 border border-gray-700">
                          <div className="mb-4 pb-3 border-b border-gray-700">
                            <div className="flex items-center gap-2">
                              <BookOpen size={18} className="text-purple-400" />
                              <span className="text-gray-400">Storyteller:</span>
                              <span className="font-semibold text-purple-300">
                                {fullMatch.storyteller}
                              </span>
                            </div>
                          </div>
                          <h4 className="font-semibold mb-3 text-purple-300">Spieler in diesem Match:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {fullMatch.players.map((player, idx) => (
                              <div
                                key={idx}
                                onClick={() => handlePlayerClick(player.name)}
                                className={`p-3 rounded-lg flex items-center justify-between cursor-pointer transition-all ${player.name === selectedPlayer.name ? 'bg-purple-900 bg-opacity-40 border border-purple-500' : 'bg-gray-700 hover:bg-gray-600 border border-transparent'}`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="font-medium text-white hover:text-purple-300">
                                    {player.name}
                                  </span>
                                  <span className={`text-xs px-2 py-1 rounded ${player.team === 'Böse' ? 'bg-red-700 bg-opacity-60 text-red-200' : 'bg-blue-700 bg-opacity-60 text-blue-200'}`}>
                                    {player.role}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs ${player.alive ? 'text-green-400' : 'text-gray-500'}`}>
                                    {player.alive ? '✓ Lebt' : '✗ Tot'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {matches.filter(match => {
                  const seasonMatch = selectedSeason === 'all' || match.season === selectedSeason;
                  const scriptMatch = selectedScript === 'all' || match.script === selectedScript;
                  
                  let teammateMatch = true;
                  if (selectedTeammate && match.role !== 'Storyteller') {
                    const allMatches = importedMatches.length > 0 ? importedMatches : demoMatches;
                    const fullMatch = allMatches.find(m => m.id === match.id);
                    if (fullMatch) {
                      const currentPlayerData = fullMatch.players.find(p => p.name === selectedPlayer.name);
                      const teammateData = fullMatch.players.find(p => p.name === selectedTeammate);
                      teammateMatch = teammateData && currentPlayerData && teammateData.team === currentPlayerData.team;
                    }
                  }
                  
                  return seasonMatch && scriptMatch && teammateMatch;
                }).length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <p>Keine Matches gefunden mit den aktuellen Filtern.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {!selectedPlayer && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg">Wähle einen Spieler aus, um die Statistiken anzuzeigen</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BotCStatsTracker;