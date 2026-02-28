import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, Users, Award, Skull, Heart, ChevronDown, ChevronUp, BookOpen, Calendar, Scroll, UserCheck, Upload, X, AlertCircle, Trash2, LayoutGrid, User, ArrowUpDown, ArrowUp, ArrowDown, Trophy, Shield, Crown } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

const ROLE_CATEGORIES = {
  Info: ['Washerwoman','Librarian','Investigator','Chef','Empath','Fortune Teller','Undertaker','Ravenkeeper','Flowergirl','Town Crier','Oracle','Seamstress','Mathematician','Clockmaker','Dreamer','Balloonist','Juggler','Savant','Artist','Bounty Hunter','Poppy Grower','Gossip','General','Chambermaid','Pixie','Amnesiac','King','Shugenja','Sage','Village Idiot','Fisherman','Vizier','Alchemist','Cannibal','Huntsman','Grandmother','Gambler','Snake Charmer','Philosopher','Slayer','Virgin'],
  Schutz: ['Monk','Sailor','Innkeeper','Minstrel','Tea Lady','Pacifist','Fool','Soldier','Lycanthrope','Nightwatchman','Professor','Bodyguard','Noble','Farmer','Acrobat','Mayor','Exorcist','Courtier'],
  Aussenseiter: ['Drunk','Recluse','Saint','Butler','Lunatic','Mutant','Barber','Moonchild','Goon','Damsel','Plague Doctor','Snitch','Politician','Zealot','Sweetheart','Klutz','Tinker'],
  Minion: ['Poisoner','Spy','Scarlet Woman','Baron','Godfather','Assassin','Mastermind','Evil Twin','Witch','Cerenovus','Pit-Hag','Mezepheles','Psychopath','Organ Grinder','Marionette','Harpy','Fearmonger','Summoner',"Devil's Advocate"],
  Daemon: ['Imp','Zombuul','Pukka','Shabaloth','Po','Vigormortis','No Dashii','Vortox','Fang Gu','Al-Hadikhia','Leviathan','Ojo','Kazali','Yaggababble','Lleech'],
};

const CATEGORY_DISPLAY = {
  Info:         { label: 'Info',         color: '#60a5fa', emoji: '🔍' },
  Schutz:       { label: 'Schutz',       color: '#34d399', emoji: '🛡️' },
  Aussenseiter: { label: 'Außenseiter',  color: '#a78bfa', emoji: '🎭' },
  Minion:       { label: 'Böse Support', color: '#f87171', emoji: '🗡️' },
  Daemon:       { label: 'Dämon',        color: '#fb7185', emoji: '😈' },
  Sonstige:     { label: 'Sonstige',     color: '#9ca3af', emoji: '❓' },
};

const normalizeRoleName = (s) =>
  s.toLowerCase()
   .replace(/[\u2018\u2019\u02BC\u0060\u00B4\u2032'`]/g, '')
   .replace(/\s+/g, ' ')
   .trim();

const getRoleCategory = (role) => {
  const norm = normalizeRoleName(role);
  for (const [cat, roles] of Object.entries(ROLE_CATEGORIES)) {
    if (roles.some(r => normalizeRoleName(r) === norm)) return cat;
  }
  return 'Sonstige';
};

const BotCStatsTracker = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [matches, setMatches] = useState([]);
  const [playerStats, setPlayerStats] = useState(null);
  const [expandedMatch, setExpandedMatch] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState('all');
  const [selectedScript, setSelectedScript] = useState('all');
  const [selectedTeammate, setSelectedTeammate] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [importData, setImportData] = useState('');
  const [importError, setImportError] = useState('');
  const [importedMatches, setImportedMatches] = useState([]);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastImportDate, setLastImportDate] = useState(null);
  const [activePage, setActivePage] = useState('player');

  // Leaderboard state
  const [lbSortKey, setLbSortKey] = useState('winrate');
  const [lbSortDir, setLbSortDir] = useState('desc');
  const [lbSeason, setLbSeason] = useState('all');
  const [lbScript, setLbScript] = useState('all');
  const [lbSearch, setLbSearch] = useState('');
  const [lbTeamFilter, setLbTeamFilter] = useState('all');
  const [lbMinGames, setLbMinGames] = useState(5);
  const [hofSeason, setHofSeason] = useState('all');
  const [hofMinGames, setHofMinGames] = useState(5);
  const [hofView, setHofView] = useState('scripts');
  const [rsScript, setRsScript] = useState('all');
  const [rsSeason, setRsSeason] = useState('all');
  const [rsTeam, setRsTeam] = useState('all');
  const [rsSort, setRsSort] = useState('games');
  const [rsSortDir, setRsSortDir] = useState('desc');
  const [rsSearch, setRsSearch] = useState('');
  const [rsCategory, setRsCategory] = useState('all');
  const [rsMinGames, setRsMinGames] = useState(1);
  const [rrMode, setRrMode] = useState('role');
  const [rrSelected, setRrSelected] = useState(null);
  const [rrSeason, setRrSeason] = useState('all');
  const [rrScript, setRrScript] = useState('all');
  const [rrMinGames, setRrMinGames] = useState(1);
  const [rrSort, setRrSort] = useState('winrate');
  const [rrSortDir, setRrSortDir] = useState('desc');
  const [rrTeam, setRrTeam] = useState('all');
  const [rrShowHighlights, setRrShowHighlights] = useState(false);
  const [rsShowHighlights, setRsShowHighlights] = useState(false);
  const [rsShowAnalysis, setRsShowAnalysis] = useState(false);
  const [rsAnalysisMinGames, setRsAnalysisMinGames] = useState(3);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionShowHighlights, setSessionShowHighlights] = useState(false);
  const [sessionHighlightYear, setSessionHighlightYear] = useState("all");

  const [titleClicks, setTitleClicks] = useState(0);
  const demoMatches = [
    { id: 1, date: '2025-01-20', season: '2025', script: 'Trouble Brewing', storyteller: 'ClockMaster',
      players: [
        { name: 'ShadowPlayer', role: 'Imp', team: 'Böse', alive: false, result: 'Sieg' },
        { name: 'TowerGuard', role: 'Washerwoman', team: 'Gut', alive: false, result: 'Niederlage' },
        { name: 'NightOwl', role: 'Baron', team: 'Böse', alive: true, result: 'Sieg' },
        { name: 'MoonShadow', role: 'Ravenkeeper', team: 'Gut', alive: false, result: 'Niederlage' }
      ]
    },
    { id: 2, date: '2025-01-19', season: '2025', script: 'Bad Moon Rising', storyteller: 'TowerGuard',
      players: [
        { name: 'ShadowPlayer', role: 'Tea Lady', team: 'Gut', alive: true, result: 'Sieg' },
        { name: 'ClockMaster', role: 'Zombuul', team: 'Böse', alive: false, result: 'Niederlage' },
        { name: 'NightOwl', role: 'Godfather', team: 'Böse', alive: false, result: 'Niederlage' }
      ]
    },
    { id: 3, date: '2025-01-18', season: '2025', script: 'Sects and Violets', storyteller: 'MoonShadow',
      players: [
        { name: 'ShadowPlayer', role: 'Vigormortis', team: 'Böse', alive: false, result: 'Niederlage' },
        { name: 'TowerGuard', role: 'Flowergirl', team: 'Gut', alive: true, result: 'Sieg' },
        { name: 'ClockMaster', role: 'Sage', team: 'Gut', alive: false, result: 'Sieg' }
      ]
    }
  ];

  useEffect(() => { loadData(); }, []);

  const parseTxtToMatches = (rawText) => {
    const lines = rawText.trim().split('\n').filter(l => l.trim());
    if (lines.length < 2) return [];
    const gameData = {};
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split('\t');
      if (values.length < 7) continue;
      const gameId = values[0].trim(), dateStr = values[1].trim(), playerName = values[2].trim();
      const role = values[3].trim(), resultStr = values[4].trim(), scriptShort = values[5].trim(), teamStr = values[6].trim();
      if (!gameId || !playerName || !role) continue;
      const result = resultStr.toLowerCase() === 'win' ? 'Sieg' : 'Niederlage';
      const team = teamStr.toLowerCase() === 'good' ? 'Gut' : 'Böse';
      const dateParts = dateStr.split('/');
      const formattedDate = dateParts.length === 3
        ? `${dateParts[2]}-${dateParts[1].padStart(2,'0')}-${dateParts[0].padStart(2,'0')}`
        : dateStr;
      const scriptMap = { 'S&V': 'Sects and Violets', 'TB': 'Trouble Brewing', 'BMR': 'Bad Moon Rising' };
      const script = scriptMap[scriptShort] || scriptShort;
      if (!gameData[gameId]) {
        gameData[gameId] = { id: parseInt(gameId) || 0, date: formattedDate, season: dateParts.length === 3 ? dateParts[2] : '2025', script, storyteller: 'Unknown', players: [] };
      }
      gameData[gameId].players.push({ name: playerName, role, team, alive: true, result });
    }
    return Object.values(gameData);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const base = (typeof window !== 'undefined' && window.location.pathname.includes('/botc-opgg')) ? '/botc-opgg/' : '/';
      const url = `${base}games.txt?t=` + Date.now();
      console.log('[BotC] Versuche games.txt zu laden von:', url);
      const res = await fetch(url);
      console.log('[BotC] fetch Status:', res.status, res.ok);
      if (res.ok) {
        const text = await res.text();
        console.log('[BotC] games.txt geladen, Länge:', text.length, 'erste Zeile:', text.split('\n')[0]);
        const matches = parseTxtToMatches(text);
        console.log('[BotC] Geparste Spiele:', matches.length);
        if (matches.length > 0) {
          setImportedMatches(matches);
          const uniquePlayers = new Set();
          matches.forEach(m => m.players.forEach(p => uniquePlayers.add(p.name)));
          setAvailablePlayers(Array.from(uniquePlayers).sort().map((name, idx) => ({ id: idx+1, name, avatar: '👤' })));
          setLastImportDate('games.txt (' + matches.length + ' Spiele)');
          setIsLoading(false);
          return;
        } else {
          console.warn('[BotC] games.txt gefunden aber keine Spiele geparst. Inhalt:', text.substring(0, 200));
        }
      }
    } catch (e) {
      console.warn('[BotC] games.txt fetch fehlgeschlagen:', e.message);
    }
    // Fallback: localStorage
    try {
      const savedMatches = localStorage.getItem('botc-matches');
      const savedDate = localStorage.getItem('botc-import-date');
      if (savedMatches) {
        const matches = JSON.parse(savedMatches);
        setImportedMatches(matches);
        const uniquePlayers = new Set();
        matches.forEach(m => m.players.forEach(p => uniquePlayers.add(p.name)));
        setAvailablePlayers(Array.from(uniquePlayers).sort().map((name, idx) => ({ id: idx+1, name, avatar: '👤' })));
      }
      if (savedDate) setLastImportDate(savedDate);
    } catch (error) {
      console.log('Fehler beim Laden:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSavedData = () => { loadData(); };

  const saveMatchesToStorage = (matchesArray) => {
    try {
      localStorage.setItem('botc-matches', JSON.stringify(matchesArray));
      const now = new Date().toLocaleString('de-DE');
      localStorage.setItem('botc-import-date', now);
      setLastImportDate(now);
    } catch (error) {
      alert('⚠️ Fehler beim Speichern der Daten.');
    }
  };

  const clearStoredData = () => {
    if (confirm('Möchtest du wirklich alle gespeicherten Spiele löschen?')) {
      try {
        localStorage.removeItem('botc-matches');
        localStorage.removeItem('botc-import-date');
        setImportedMatches([]);
        setLastImportDate(null);
        alert('✅ Alle gespeicherten Daten wurden gelöscht.');
      } catch (error) {
        alert('⚠️ Fehler beim Löschen der Daten.');
      }
    }
  };

  const parseImportData = (data) => {
    try {
      setImportError('');
      const lines = data.trim().split('\n').filter(line => line.trim());
      if (lines.length < 2) { setImportError('Keine gültigen Daten gefunden.'); return; }
      const gameData = {};
      let parsedCount = 0, skippedCount = 0;
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split('\t');
        if (values.length < 7) { skippedCount++; continue; }
        const gameId = values[0].trim(), dateStr = values[1].trim(), playerName = values[2].trim();
        const role = values[3].trim(), resultStr = values[4].trim(), scriptShort = values[5].trim(), teamStr = values[6].trim();
        if (!gameId || !playerName || !role) { skippedCount++; continue; }
        const result = resultStr.toLowerCase() === 'win' ? 'Sieg' : 'Niederlage';
        const team = teamStr.toLowerCase() === 'good' ? 'Gut' : 'Böse';
        const dateParts = dateStr.split('/');
        const formattedDate = dateParts.length === 3 ? `${dateParts[2]}-${dateParts[1].padStart(2,'0')}-${dateParts[0].padStart(2,'0')}` : dateStr;
        const scriptMap = { 'S&V': 'Sects and Violets', 'TB': 'Trouble Brewing', 'BMR': 'Bad Moon Rising' };
        const script = scriptMap[scriptShort] || scriptShort;
        if (!gameData[gameId]) {
          gameData[gameId] = { id: parseInt(gameId) || parsedCount, date: formattedDate, season: dateParts.length === 3 ? dateParts[2] : '2025', script, storyteller: 'Unknown', players: [] };
        }
        gameData[gameId].players.push({ name: playerName, role, team, alive: Math.random() > 0.4, result });
        parsedCount++;
      }
      const matchesArray = Object.values(gameData);
      if (matchesArray.length === 0) { setImportError('Keine gültigen Spiele gefunden.'); return; }
      saveMatchesToStorage(matchesArray);
      setImportedMatches(matchesArray);
      const uniquePlayers = new Set();
      matchesArray.forEach(m => m.players.forEach(p => uniquePlayers.add(p.name)));
      setAvailablePlayers(Array.from(uniquePlayers).sort().map((name, idx) => ({ id: idx+1, name, avatar: '👤' })));
      setShowImport(false);
      setImportData('');
      alert(`✅ Import erfolgreich!\n\n${matchesArray.length} Spiele importiert\n${uniquePlayers.size} Spieler gefunden${skippedCount > 0 ? `\n${skippedCount} Zeilen übersprungen` : ''}`);
    } catch (error) {
      setImportError('Fehler beim Parsen: ' + error.message);
    }
  };

  const getAllMatches = () => importedMatches.length > 0 ? importedMatches : demoMatches;

  const getPlayerMatches = (playerName) => {
    return getAllMatches().filter(match => match.players.some(p => p.name === playerName) || match.storyteller === playerName)
      .map(match => {
        const playerData = match.players.find(p => p.name === playerName);
        if (playerData) return { ...match, role: playerData.role, team: playerData.team, result: playerData.result, alive: playerData.alive };
        return { ...match, role: 'Storyteller', team: 'Storyteller', result: '-', alive: true };
      }).sort((a, b) => {
        const dateDiff = new Date(b.date) - new Date(a.date);
        if (dateDiff !== 0) return dateDiff;
        return b.id - a.id; // gleicher Tag → höhere Spiel-Nr. = neuer = weiter oben
      });
  };

  const calculateStatsForPlayer = (playerName, filterSeason = 'all', filterScript = 'all') => {
    const allMatches = getAllMatches();
    let playerMatchList = getPlayerMatches(playerName);
    if (filterSeason !== 'all') playerMatchList = playerMatchList.filter(m => getMatchSeason(m.date) === filterSeason);
    if (filterScript !== 'all') playerMatchList = playerMatchList.filter(m => m.script === filterScript);
    const playedMatches = playerMatchList.filter(m => m.role !== 'Storyteller');
    const total = playedMatches.length;
    const wins = playedMatches.filter(m => m.result === 'Sieg').length;
    const evilMatches = playedMatches.filter(m => m.team === 'Böse');
    const goodMatches = playedMatches.filter(m => m.team === 'Gut');
    const evilWins = evilMatches.filter(m => m.result === 'Sieg').length;
    const goodWins = goodMatches.filter(m => m.result === 'Sieg').length;
    let allFilteredMatches = allMatches;
    if (filterSeason !== 'all') allFilteredMatches = allFilteredMatches.filter(m => getMatchSeason(m.date) === filterSeason);
    if (filterScript !== 'all') allFilteredMatches = allFilteredMatches.filter(m => m.script === filterScript);
    const stGames = allFilteredMatches.filter(m => m.storyteller === playerName).length;
    return {
      total, wins,
      winrate: total > 0 ? parseFloat(((wins / total) * 100).toFixed(1)) : 0,
      evilGames: evilMatches.length, evilWins,
      goodGames: goodMatches.length, goodWins,
      evilWinrate: evilMatches.length > 0 ? parseFloat(((evilWins / evilMatches.length) * 100).toFixed(1)) : 0,
      goodWinrate: goodMatches.length > 0 ? parseFloat(((goodWins / goodMatches.length) * 100).toFixed(1)) : 0,
      storytellerGames: stGames,
    };
  };

  const calculateStats = (playerMatches, playerName) => {
    const resolvedName = playerName ?? selectedPlayer?.name;
    const allMatches = getAllMatches();
    let filteredMatches = selectedSeason === 'all' ? playerMatches : playerMatches.filter(m => getMatchSeason(m.date) === selectedSeason);
    if (selectedScript !== 'all') filteredMatches = filteredMatches.filter(m => m.script === selectedScript);
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
    const roleCounts = {}, roleWins = {};
    playedMatches.forEach(m => {
      roleCounts[m.role] = (roleCounts[m.role] || 0) + 1;
      if (m.result === 'Sieg') roleWins[m.role] = (roleWins[m.role] || 0) + 1;
    });
    const roleStats = Object.keys(roleCounts).map(role => ({
      role, games: roleCounts[role], wins: roleWins[role] || 0,
      winrate: ((roleWins[role] || 0) / roleCounts[role] * 100).toFixed(1)
    })).sort((a, b) => b.games - a.games);
    let allFilteredMatches = selectedSeason === 'all' ? allMatches : allMatches.filter(m => getMatchSeason(m.date) === selectedSeason);
    if (selectedScript !== 'all') allFilteredMatches = allFilteredMatches.filter(m => m.script === selectedScript);
    const stGames = allFilteredMatches.filter(m => m.storyteller === resolvedName);

    const teammateStats = {};
    allFilteredMatches.forEach(fullMatch => {
      const currentPlayerData = fullMatch.players.find(p => p.name === resolvedName);
      if (!currentPlayerData) return;
      const playerMatchEntry = playedMatches.find(m => m.id === fullMatch.id);
      if (!playerMatchEntry) return;
      fullMatch.players.forEach(p => {
        if (p.name === resolvedName) return;
        if (!teammateStats[p.name]) teammateStats[p.name] = { name: p.name, sameTeam: 0, sameTeamWins: 0, oppTeam: 0, oppTeamWins: 0, total: 0 };
        teammateStats[p.name].total++;
        if (p.team === currentPlayerData.team) {
          teammateStats[p.name].sameTeam++;
          if (playerMatchEntry.result === 'Sieg') teammateStats[p.name].sameTeamWins++;
        } else {
          teammateStats[p.name].oppTeam++;
          if (playerMatchEntry.result === 'Sieg') teammateStats[p.name].oppTeamWins++;
        }
      });
    });

    const catMap = {};
    playedMatches.forEach(m => {
      const cat = getRoleCategory(m.role);
      if (!catMap[cat]) catMap[cat] = { wins: 0, total: 0 };
      catMap[cat].total++;
      if (m.result === 'Sieg') catMap[cat].wins++;
    });
    const radarData = Object.entries(CATEGORY_DISPLAY).map(([key, cfg]) => {
      const d = catMap[key];
      return {
        category: cfg.label,
        emoji: cfg.emoji,
        color: cfg.color,
        winrate: d ? parseFloat(((d.wins / d.total) * 100).toFixed(1)) : null,
        games: d ? d.total : 0,
        wins: d ? d.wins : 0,
      };
    }).filter(d => d.games > 0);

    return {
      total, wins, winrate,
      evilGames: evilMatches.length, evilWins, goodGames: goodMatches.length, goodWins, evilWinrate, goodWinrate,
      roleStats, storytellerGames: stGames.length, radarData,
      teammateStats: Object.values(teammateStats).map(t => ({
        ...t,
        winrate: t.sameTeam > 0 ? ((t.sameTeamWins / t.sameTeam) * 100).toFixed(1) : null,
        oppWinrate: t.oppTeam > 0 ? ((t.oppTeamWins / t.oppTeam) * 100).toFixed(1) : null,
      })).sort((a, b) => b.total - a.total)
    };
  };

  const handlePlayerClick = (playerName) => {
    const player = availablePlayers.find(p => p.name === playerName);
    if (player) {
      const playerMatches = getPlayerMatches(player.name);
      setSelectedPlayer(player);
      setMatches(playerMatches);
      setPlayerStats(calculateStats(playerMatches, player.name));
      setExpandedMatch(null);
      setSearchQuery('');
      setSelectedTeammate(null);
      setSelectedCategory(null);
      setActivePage('player');
    }
  };

  // Season logic: Season 1 = all 2025 + Jan 2026, Season 2 = Feb 2026 - Jan 2027, etc.
  const getMatchSeason = (date) => {
    if (!date) return '1';
    const [year, month] = date.split('-').map(Number);
    if (year < 2026) return '1';
    if (month === 1) return String(year - 2025);   // Jan 2026 → S1, Jan 2027 → S2
    return String(year - 2024);                     // Feb 2026 → S2, Feb 2027 → S3
  };

  const getAvailableYears = () => {
    const seasons = new Set();
    getAllMatches().forEach(m => seasons.add(getMatchSeason(m.date)));
    return Array.from(seasons).sort((a,b) => Number(b) - Number(a));
  };

  const getAvailableScripts = () => {
    const scripts = new Set();
    getAllMatches().forEach(m => scripts.add(m.script));
    return Array.from(scripts).sort();
  };

  useEffect(() => {
    const currentMatches = getAllMatches();
    const uniquePlayers = new Set();
    currentMatches.forEach(match => match.players.forEach(p => uniquePlayers.add(p.name)));
    const playersList = Array.from(uniquePlayers).sort().map((name, idx) => ({ id: idx+1, name, avatar: '👤' }));
    setAvailablePlayers(playersList);
    if (playersList.length > 0 && !selectedPlayer) {
      const player = playersList[0];
      const playerMatches = getPlayerMatches(player.name);
      setSelectedPlayer(player);
      setMatches(playerMatches);
    }
    // Auto-select newest season for leaderboard
    const seasons = [...new Set(currentMatches.map(m => getMatchSeason(m.date)))].sort((a,b) => Number(b)-Number(a));
    if (seasons.length > 0) setLbSeason(seasons[0]);
  }, [importedMatches]);

  useEffect(() => {
    if (selectedPlayer && matches.length > 0) setPlayerStats(calculateStats(matches, selectedPlayer.name));
  }, [selectedSeason, selectedScript]);

  const calcStreaks = (playerName, filterSeason = 'all', filterScript = 'all') => {
    const allMatches = getAllMatches();
    let ms = allMatches
      .filter(m => m.players.some(p => p.name === playerName))
      .filter(m => filterSeason === 'all' || getMatchSeason(m.date) === filterSeason)
      .filter(m => filterScript === 'all' || m.script === filterScript)
      .map(m => {
        const p = m.players.find(x => x.name === playerName);
        return p ? { result: p.result, team: p.team, date: m.date } : null;
      })
      .filter(Boolean)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    let maxWin = 0, maxLose = 0, maxGood = 0, maxEvil = 0;
    let curWin = 0, curLose = 0, curGood = 0, curEvil = 0;

    ms.forEach(m => {
      if (m.result === 'Sieg') { curWin++; curLose = 0; }
      else { curLose++; curWin = 0; }
      maxWin  = Math.max(maxWin,  curWin);
      maxLose = Math.max(maxLose, curLose);
      if (m.team === 'Gut')  { curGood++; curEvil = 0; }
      else                   { curEvil++; curGood = 0; }
      maxGood = Math.max(maxGood, curGood);
      maxEvil = Math.max(maxEvil, curEvil);
    });

    return { maxWin, maxLose, maxGood, maxEvil, curWin, curLose };
  };

  const getLeaderboardData = () => {
    const allMatches = getAllMatches();
    const scripts3 = ['Trouble Brewing', 'Bad Moon Rising', 'Sects and Violets'];
    const build = (minGames) => availablePlayers.map(player => {
      const base = calculateStatsForPlayer(player.name, lbSeason, lbScript);
      const scriptStats = {};
      scripts3.forEach(sc => {
        const ms = allMatches.filter(m => m.script === sc && m.players.some(p => p.name === player.name));
        const filtered = lbSeason !== 'all' ? ms.filter(m => getMatchSeason(m.date) === lbSeason) : ms;
        const wins = filtered.filter(m => m.players.find(p => p.name === player.name)?.result === 'Sieg').length;
        scriptStats[sc] = { games: filtered.length, wins, wr: filtered.length > 0 ? parseFloat(((wins/filtered.length)*100).toFixed(1)) : null };
      });
      return { ...player, ...base, scriptStats };
    }).filter(p => {
      if (p.total < minGames) return false;
      if (lbSearch && !p.name.toLowerCase().includes(lbSearch.toLowerCase())) return false;
      if (lbTeamFilter === 'good' && p.goodGames === 0) return false;
      if (lbTeamFilter === 'evil' && p.evilGames === 0) return false;
      return true;
    }).sort((a, b) => {
      const getVal = (p) => {
        if (lbTeamFilter === 'good') return lbSortKey === 'winrate' ? p.goodWinrate : (lbSortKey === 'evilWinrate' ? p.goodWinrate : p[lbSortKey]);
        if (lbTeamFilter === 'evil') return lbSortKey === 'winrate' ? p.evilWinrate : (lbSortKey === 'goodWinrate' ? p.evilWinrate : p[lbSortKey]);
        return p[lbSortKey] ?? 0;
      };
      const av = getVal(a), bv = getVal(b);
      return lbSortDir === 'desc' ? bv - av : av - bv;
    });

    const result = build(lbMinGames);
    return result.length > 0 ? result : build(1);
  };


  const getRolesData = () => {
    const allMatches = getAllMatches();
    let filtered = allMatches;
    if (rsSeason !== 'all') filtered = filtered.filter(m => getMatchSeason(m.date) === rsSeason);
    if (rsScript !== 'all') filtered = filtered.filter(m => m.script === rsScript);

    const roleMap = {};
    filtered.forEach(match => {
      match.players.forEach(p => {
        if (rsTeam === 'good' && p.team !== 'Gut') return;
        if (rsTeam === 'evil' && p.team !== 'Böse') return;
        const key = p.role;
        if (!roleMap[key]) roleMap[key] = {
          role: key,
          category: getRoleCategory(key),
          team: p.team,
          games: 0, wins: 0,
          players: new Set(),
        };
        roleMap[key].games++;
        if (p.result === 'Sieg') roleMap[key].wins++;
        roleMap[key].players.add(p.name);
      });
    });

    let rows = Object.values(roleMap).map(r => ({
      ...r,
      players: r.players.size,
      winrate: r.games > 0 ? parseFloat(((r.wins / r.games) * 100).toFixed(1)) : 0,
      losses: r.games - r.wins,
    }));

    if (rsSearch) rows = rows.filter(r => r.role.toLowerCase().includes(rsSearch.toLowerCase()));
    rows = rows.filter(r => r.games >= rsMinGames);
    if (rsCategory !== 'all') {
      const catKey = Object.keys(CATEGORY_DISPLAY).find(k => CATEGORY_DISPLAY[k].label === rsCategory);
      rows = rows.filter(r => r.category === catKey);
    }

    rows.sort((a, b) => {
      let av = a[rsSort] ?? 0, bv = b[rsSort] ?? 0;
      if (rsSort === 'name') { av = a.role; bv = b.role; return rsSortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av); }
      return rsSortDir === 'desc' ? bv - av : av - bv;
    });
    return rows;
  };


  const getRoleRankingData = () => {
    const allMatches = getAllMatches();
    let filtered = allMatches;
    if (rrSeason !== 'all') filtered = filtered.filter(m => getMatchSeason(m.date) === rrSeason);
    if (rrScript !== 'all') filtered = filtered.filter(m => m.script === rrScript);

    const rolesSet = new Set();
    filtered.forEach(m => m.players.forEach(p => {
      if (rrTeam === 'good' && p.team !== 'Gut') return;
      if (rrTeam === 'evil' && p.team !== 'Böse') return;
      rolesSet.add(p.role);
    }));
    const allRoles = Array.from(rolesSet).sort();

    const playerMap = {};
    filtered.forEach(match => {
      match.players.forEach(p => {
        const matchesCriteria = rrMode === 'role'
          ? rrSelected && p.role === rrSelected
          : rrSelected && getRoleCategory(p.role) === rrSelected;
        if (!matchesCriteria) return;
        if (rrTeam === 'good' && p.team !== 'Gut') return;
        if (rrTeam === 'evil' && p.team !== 'Böse') return;
        if (!playerMap[p.name]) playerMap[p.name] = { name: p.name, games: 0, wins: 0, roles: new Set() };
        playerMap[p.name].games++;
        if (p.result === 'Sieg') playerMap[p.name].wins++;
        playerMap[p.name].roles.add(p.role);
      });
    });

    let rows = Object.values(playerMap)
      .filter(p => p.games >= rrMinGames)
      .map(p => ({
        ...p,
        roles: Array.from(p.roles).sort().join(', '),
        losses: p.games - p.wins,
        winrate: p.games > 0 ? parseFloat(((p.wins / p.games) * 100).toFixed(1)) : 0,
      }));

    rows.sort((a, b) => {
      const av = a[rrSort] ?? 0, bv = b[rrSort] ?? 0;
      return rrSortDir === 'desc' ? bv - av : av - bv;
    });

    return { rows, allRoles };
  };


  const getHallOfFameData = () => {
    const allMatches = getAllMatches();
    const filtered = hofSeason === 'all'
      ? allMatches
      : allMatches.filter(m => getMatchSeason(m.date) === hofSeason);

    const scripts = ['__all__', ...Array.from(new Set(filtered.map(m => m.script))).sort()];

    return scripts.map(script => {
      const scriptMatches = script === '__all__' ? filtered : filtered.filter(m => m.script === script);

      const playerMap = {};
      scriptMatches.forEach(match => {
        match.players.forEach(p => {
          if (!playerMap[p.name]) playerMap[p.name] = { name: p.name, wins: 0, total: 0 };
          playerMap[p.name].total++;
          if (p.result === 'Sieg') playerMap[p.name].wins++;
        });
      });

      const ranked = Object.values(playerMap)
        .filter(p => p.total >= hofMinGames)
        .map(p => ({ ...p, winrate: parseFloat(((p.wins / p.total) * 100).toFixed(1)) }))
        .sort((a, b) => b.winrate - a.winrate || b.total - a.total)
        .slice(0, 3);

      return { script, label: script === '__all__' ? 'Alle Scripts' : script, top3: ranked };
    });
  };


  const getHallOfFameCategoryData = () => {
    const allMatches = getAllMatches();
    const filtered = hofSeason === 'all'
      ? allMatches
      : allMatches.filter(m => getMatchSeason(m.date) === hofSeason);

    return Object.entries(CATEGORY_DISPLAY).map(([catKey, cfg]) => {
      const playerMap = {};
      filtered.forEach(match => {
        match.players.forEach(p => {
          if (getRoleCategory(p.role) !== catKey) return;
          if (!playerMap[p.name]) playerMap[p.name] = { name: p.name, wins: 0, total: 0 };
          playerMap[p.name].total++;
          if (p.result === 'Sieg') playerMap[p.name].wins++;
        });
      });
      const top3 = Object.values(playerMap)
        .filter(p => p.total >= hofMinGames)
        .map(p => ({ ...p, winrate: parseFloat(((p.wins / p.total) * 100).toFixed(1)) }))
        .sort((a, b) => b.winrate - a.winrate || b.total - a.total)
        .slice(0, 3);
      return { catKey, label: cfg.label, emoji: cfg.emoji, color: cfg.color, top3 };
    });
  };

  const getSessionHighlightsData = (yearFilter = 'all') => {
    const allMatches = getAllMatches();
    let dates = [...new Set(allMatches.map(m => m.date).filter(Boolean))].sort();
    if (yearFilter !== 'all') dates = dates.filter(d => getMatchSeason(d) === yearFilter);
    if (dates.length === 0) return null;

    // Per-player session stats
    const playerMap = {};

    dates.forEach(date => {
      const sessionMatches = allMatches.filter(m => m.date === date);
      const playersInSession = new Set();
      const playerResults = {}; // name -> { wins, games }

      sessionMatches.forEach(match => {
        match.players.forEach(p => {
          playersInSession.add(p.name);
          if (!playerResults[p.name]) playerResults[p.name] = { wins: 0, games: 0 };
          playerResults[p.name].games++;
          if (p.result === 'Sieg') playerResults[p.name].wins++;
        });
      });

      playersInSession.forEach(name => {
        if (!playerMap[name]) playerMap[name] = {
          name,
          sessions: 0,
          sessionsWon: 0,  // sessions where winrate >= 50%
          sessionsPerfect: 0, // sessions where winrate = 100%
          sessionsLost: 0, // sessions where winrate = 0%
          totalWins: 0,
          totalGames: 0,
          bestSessionWr: 0,
          worstSessionWr: 100,
          currentStreak: 0,  // current consecutive sessions with >50% wr
          bestStreak: 0,
          streakBuf: 0,
        };
        const pr = playerResults[name];
        const sessionWr = pr.games > 0 ? (pr.wins / pr.games) * 100 : 0;
        const p = playerMap[name];
        p.sessions++;
        p.totalWins += pr.wins;
        p.totalGames += pr.games;
        if (sessionWr >= 50) { p.sessionsWon++; p.streakBuf++; } else { p.streakBuf = 0; }
        if (sessionWr === 100) p.sessionsPerfect++;
        if (sessionWr === 0 && pr.games > 0) p.sessionsLost++;
        if (sessionWr > p.bestSessionWr) p.bestSessionWr = parseFloat(sessionWr.toFixed(1));
        if (sessionWr < p.worstSessionWr) p.worstSessionWr = parseFloat(sessionWr.toFixed(1));
        p.bestStreak = Math.max(p.bestStreak, p.streakBuf);
      });
    });

    // finalize current streak (from most recent sessions)
    Object.values(playerMap).forEach(p => { p.currentStreak = p.streakBuf; });

    const players = Object.values(playerMap).map(p => ({
      ...p,
      sessionWinrate: p.sessions > 0 ? parseFloat(((p.sessionsWon / p.sessions) * 100).toFixed(1)) : 0,
      overallWinrate: p.totalGames > 0 ? parseFloat(((p.totalWins / p.totalGames) * 100).toFixed(1)) : 0,
    }));

    const best = (arr, key) => [...arr].sort((a,b) => (b[key]??0)-(a[key]??0))[0];

    return {
      totalSessions: dates.length,
      mostSessions:       best(players, 'sessions'),
      mostSessionsWon:    best(players, 'sessionsWon'),
      mostSessionsLost:   best(players, 'sessionsLost'),
      mostPerfect:        best(players, 'sessionsPerfect'),
      bestSessionWr:      [...players].filter(p => p.sessions >= 3).sort((a,b) => b.sessionWinrate - a.sessionWinrate)[0],
      worstSessionWr:     [...players].filter(p => p.sessions >= 3).sort((a,b) => a.sessionWinrate - b.sessionWinrate)[0],
      bestStreak:         best(players, 'bestStreak'),
      currentStreak:      [...players].filter(p => p.currentStreak > 0).sort((a,b) => b.currentStreak - a.currentStreak)[0],
      mostTotalWins:      best(players, 'totalWins'),
    };
  };

  const getSessionDates = () => {
    const allMatches = getAllMatches();
    return [...new Set(allMatches.map(m => m.date).filter(Boolean))].sort().reverse();
  };

  const getLastSessionData = (forDate = null) => {
    const allMatches = getAllMatches();
    if (allMatches.length === 0) return { date: null, matches: [], playerStats: [] };

    const dates = [...new Set(allMatches.map(m => m.date).filter(Boolean))].sort().reverse();
    const targetDate = forDate ?? dates[0];

    const sessionMatches = allMatches
      .filter(m => m.date === targetDate)
      .sort((a, b) => a.id - b.id);

    const playerMap = {};
    sessionMatches.forEach(match => {
      match.players.forEach(p => {
        if (!playerMap[p.name]) {
          playerMap[p.name] = {
            name: p.name,
            games: 0, wins: 0,
            goodGames: 0, goodWins: 0,
            evilGames: 0, evilWins: 0,
            roles: [],
          };
        }
        const s = playerMap[p.name];
        s.games++;
        if (p.result === 'Sieg') s.wins++;
        if (p.team === 'Gut') { s.goodGames++; if (p.result === 'Sieg') s.goodWins++; }
        else                  { s.evilGames++; if (p.result === 'Sieg') s.evilWins++; }
        s.roles.push({ role: p.role, team: p.team, result: p.result, gameId: match.id });
      });
    });

    const playerStats = Object.values(playerMap)
      .map(p => ({
        ...p,
        losses: p.games - p.wins,
        winrate: p.games > 0 ? parseFloat(((p.wins / p.games) * 100).toFixed(1)) : 0,
        goodWinrate: p.goodGames > 0 ? parseFloat(((p.goodWins / p.goodGames) * 100).toFixed(1)) : null,
        evilWinrate: p.evilGames > 0 ? parseFloat(((p.evilWins / p.evilGames) * 100).toFixed(1)) : null,
      }))
      .sort((a, b) => b.winrate - a.winrate || b.games - a.games);

    return { date: targetDate, matches: sessionMatches, playerStats, allDates: dates };
  };

  // Role synergy analysis for Rollen-Stats page
  const getRoleSynergyData = (minGames = 3) => {
    const allMatches = getAllMatches();
    let filtered = allMatches;
    if (rsSeason !== 'all') filtered = filtered.filter(m => getMatchSeason(m.date) === rsSeason);
    if (rsScript !== 'all') filtered = filtered.filter(m => m.script === rsScript);

    const pairMap = {};

    filtered.forEach(match => {
      // Group players by team
      const teams = { Gut: [], Böse: [] };
      match.players.forEach(p => { if (teams[p.team]) teams[p.team].push(p); });

      Object.values(teams).forEach(teamPlayers => {
        if (teamPlayers.length < 2) return;
        const won = teamPlayers[0].result === 'Sieg';
        // Every unique role pair in this team
        for (let i = 0; i < teamPlayers.length; i++) {
          for (let j = i + 1; j < teamPlayers.length; j++) {
            const r1 = teamPlayers[i].role;
            const r2 = teamPlayers[j].role;
            if (r1 === r2) continue; // skip same role
            const key = [r1, r2].sort().join('|||');
            if (!pairMap[key]) pairMap[key] = {
              role1: [r1,r2].sort()[0],
              role2: [r1,r2].sort()[1],
              games: 0, wins: 0,
              team: teamPlayers[0].team,
            };
            pairMap[key].games++;
            if (won) pairMap[key].wins++;
          }
        }
      });
    });

    return Object.values(pairMap)
      .filter(p => p.games >= minGames)
      .map(p => ({
        ...p,
        losses: p.games - p.wins,
        winrate: parseFloat(((p.wins / p.games) * 100).toFixed(1)),
      }))
      .sort((a, b) => b.winrate - a.winrate || b.games - a.games);
  };

  // Global highlights for Rollen-Stats page (ignores category/search/minGames filters)
  const getRSHighlightsData = () => {
    const allMatches = getAllMatches();
    let filtered = allMatches;
    if (rsSeason !== 'all') filtered = filtered.filter(m => getMatchSeason(m.date) === rsSeason);
    if (rsScript !== 'all') filtered = filtered.filter(m => m.script === rsScript);

    const roleMap = {};
    const catMap  = {};

    filtered.forEach(match => {
      match.players.forEach(p => {
        // role map
        if (!roleMap[p.role]) roleMap[p.role] = {
          role: p.role, team: p.team,
          category: getRoleCategory(p.role),
          games: 0, wins: 0, players: new Set(),
        };
        roleMap[p.role].games++;
        if (p.result === 'Sieg') roleMap[p.role].wins++;
        roleMap[p.role].players.add(p.name);

        // category map
        const cat = getRoleCategory(p.role);
        if (!catMap[cat]) catMap[cat] = { games: 0, wins: 0 };
        catMap[cat].games++;
        if (p.result === 'Sieg') catMap[cat].wins++;
      });
    });

    const roles = Object.values(roleMap).map(r => ({
      ...r,
      players: r.players.size,
      winrate: r.games > 0 ? parseFloat(((r.wins / r.games) * 100).toFixed(1)) : 0,
      losses: r.games - r.wins,
    }));

    const goodRoles = roles.filter(r => r.team === 'Gut');
    const evilRoles = roles.filter(r => r.team === 'Böse');

    const mostPlayed       = [...roles].sort((a,b) => b.games - a.games)[0];
    const mostPlayedGood   = [...goodRoles].sort((a,b) => b.games - a.games)[0];
    const mostPlayedEvil   = [...evilRoles].sort((a,b) => b.games - a.games)[0];
    const bestWR           = [...roles].filter(r => r.games >= 3).sort((a,b) => b.winrate - a.winrate)[0];
    const worstWR          = [...roles].filter(r => r.games >= 3).sort((a,b) => a.winrate - b.winrate)[0];
    const bestGoodWR       = [...goodRoles].filter(r => r.games >= 3).sort((a,b) => b.winrate - a.winrate)[0];
    const bestEvilWR       = [...evilRoles].filter(r => r.games >= 3).sort((a,b) => b.winrate - a.winrate)[0];
    const mostDiversePlayers = [...roles].sort((a,b) => b.players - a.players)[0]; // role played by most distinct players
    const mostWins         = [...roles].sort((a,b) => b.wins - a.wins)[0];
    const mostLosses       = [...roles].sort((a,b) => b.losses - a.losses)[0];

    // best & worst category (min 5 games)
    const cats = Object.entries(catMap)
      .filter(([,v]) => v.games >= 5)
      .map(([k,v]) => ({
        key: k,
        label: CATEGORY_DISPLAY[k]?.label ?? k,
        emoji: CATEGORY_DISPLAY[k]?.emoji ?? '❓',
        games: v.games, wins: v.wins,
        winrate: parseFloat(((v.wins / v.games) * 100).toFixed(1)),
      }));
    const bestCat  = [...cats].sort((a,b) => b.winrate - a.winrate)[0];
    const worstCat = [...cats].sort((a,b) => a.winrate - b.winrate)[0];

    return { mostPlayed, mostPlayedGood, mostPlayedEvil, bestWR, worstWR, bestGoodWR, bestEvilWR, mostDiversePlayers, mostWins, mostLosses, bestCat, worstCat };
  };

  // Compute global per-player-per-role stats for Rollen-Ranking highlights
  const getRRHighlightsData = () => {
    const allMatches = getAllMatches();
    let filtered = allMatches;
    if (rrSeason !== 'all') filtered = filtered.filter(m => getMatchSeason(m.date) === rrSeason);
    if (rrScript !== 'all') filtered = filtered.filter(m => m.script === rrScript);

    // ── per player+role ──
    const comboMap = {};
    const playerRoleSet = {};
    // ── per player+category ──
    const catComboMap = {};
    const playerCatSet = {};

    filtered.forEach(match => {
      match.players.forEach(p => {
        if (rrTeam === 'good' && p.team !== 'Gut') return;
        if (rrTeam === 'evil' && p.team !== 'Böse') return;

        // role combos
        const key = `${p.name}|||${p.role}`;
        if (!comboMap[key]) comboMap[key] = { player: p.name, role: p.role, games: 0, wins: 0 };
        comboMap[key].games++;
        if (p.result === 'Sieg') comboMap[key].wins++;
        if (!playerRoleSet[p.name]) playerRoleSet[p.name] = new Set();
        playerRoleSet[p.name].add(p.role);

        // category combos
        const cat = getRoleCategory(p.role);
        const catKey2 = `${p.name}|||${cat}`;
        if (!catComboMap[catKey2]) catComboMap[catKey2] = { player: p.name, cat, games: 0, wins: 0 };
        catComboMap[catKey2].games++;
        if (p.result === 'Sieg') catComboMap[catKey2].wins++;
        if (!playerCatSet[p.name]) playerCatSet[p.name] = new Set();
        playerCatSet[p.name].add(cat);
      });
    });

    const combos = Object.values(comboMap).map(c => ({
      ...c,
      winrate: c.games > 0 ? parseFloat(((c.wins / c.games) * 100).toFixed(1)) : 0,
      losses: c.games - c.wins,
    }));

    const catCombos = Object.values(catComboMap).map(c => ({
      ...c,
      label: CATEGORY_DISPLAY[c.cat]?.label ?? c.cat,
      emoji: CATEGORY_DISPLAY[c.cat]?.emoji ?? '❓',
      color: CATEGORY_DISPLAY[c.cat]?.color ?? '#fff',
      winrate: c.games > 0 ? parseFloat(((c.wins / c.games) * 100).toFixed(1)) : 0,
      losses: c.games - c.wins,
    }));

    // Role mode highlights
    const mostGames    = [...combos].sort((a,b) => b.games - a.games)[0];
    const mostWins     = [...combos].sort((a,b) => b.wins - a.wins || b.games - a.games)[0];
    const bestWR       = [...combos].filter(c => c.games >= 3).sort((a,b) => b.winrate - a.winrate || b.games - a.games)[0];
    const worstWR      = [...combos].filter(c => c.games >= 3).sort((a,b) => a.winrate - b.winrate || b.games - a.games)[0];
    const mostDiverse  = Object.entries(playerRoleSet).map(([name, roles]) => ({ name, count: roles.size })).sort((a,b) => b.count - a.count)[0];
    const mostLosses   = [...combos].sort((a,b) => b.losses - a.losses || b.games - a.games)[0];
    const playerTotals = {};
    combos.forEach(c => { playerTotals[c.player] = (playerTotals[c.player] || 0) + c.games; });
    const loyalist = [...combos]
      .filter(c => (playerTotals[c.player] || 0) >= 5)
      .map(c => ({ ...c, pct: parseFloat(((c.games / playerTotals[c.player]) * 100).toFixed(1)) }))
      .sort((a,b) => b.pct - a.pct)[0];

    // Category mode highlights
    const catMostGames  = [...catCombos].sort((a,b) => b.games - a.games)[0];
    const catMostWins   = [...catCombos].sort((a,b) => b.wins - a.wins || b.games - a.games)[0];
    const catBestWR     = [...catCombos].filter(c => c.games >= 3).sort((a,b) => b.winrate - a.winrate || b.games - a.games)[0];
    const catWorstWR    = [...catCombos].filter(c => c.games >= 3).sort((a,b) => a.winrate - b.winrate || b.games - a.games)[0];
    const catMostLosses = [...catCombos].sort((a,b) => b.losses - a.losses || b.games - a.games)[0];
    const catMostDiverse = Object.entries(playerCatSet).map(([name, cats]) => ({ name, count: cats.size })).sort((a,b) => b.count - a.count)[0];
    const catTotals = {};
    catCombos.forEach(c => { catTotals[c.player] = (catTotals[c.player] || 0) + c.games; });
    const catLoyalist = [...catCombos]
      .filter(c => (catTotals[c.player] || 0) >= 5)
      .map(c => ({ ...c, pct: parseFloat(((c.games / catTotals[c.player]) * 100).toFixed(1)) }))
      .sort((a,b) => b.pct - a.pct)[0];

    return { mostGames, mostWins, bestWR, worstWR, mostDiverse, mostLosses, loyalist, catMostGames, catMostWins, catBestWR, catWorstWR, catMostLosses, catMostDiverse, catLoyalist };
  };

  const handleLbSort = (key) => {
    if (lbSortKey === key) setLbSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setLbSortKey(key); setLbSortDir('desc'); }
  };

  const SortIcon = ({ colKey }) => {
    if (lbSortKey !== colKey) return <ArrowUpDown size={14} className="text-gray-500 ml-1" />;
    return lbSortDir === 'desc' ? <ArrowDown size={14} className="text-purple-400 ml-1" /> : <ArrowUp size={14} className="text-purple-400 ml-1" />;
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown size={18} className="text-yellow-400" />;
    if (rank === 2) return <Trophy size={18} className="text-gray-400" />;
    if (rank === 3) return <Trophy size={18} className="text-amber-600" />;
    return <span className="text-gray-500 font-mono text-sm w-[18px] text-center">{rank}</span>;
  };

  const filteredPlayers = availablePlayers.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (showImport) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-4">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-purple-400 flex items-center gap-2"><Upload size={28} />Spiele importieren</h2>
              <button onClick={() => { setShowImport(false); setImportData(''); setImportError(''); }} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2"><X size={18} />Abbrechen</button>
            </div>
            {lastImportDate && (
              <div className="mb-4 bg-green-900 bg-opacity-30 border border-green-500 rounded-lg p-4">
                <p className="text-green-200 text-sm">ℹ️ Letzter Import: {lastImportDate}</p>
                <p className="text-green-100 text-xs mt-1">Ein neuer Import wird die aktuellen Daten überschreiben.</p>
              </div>
            )}
            <div className="mb-4 bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg p-4">
              <p className="text-blue-200 mb-2 font-semibold">📋 Anleitung:</p>
              <p className="text-sm text-blue-100 mb-2">Füge deine Spieldaten im Tab-getrennten Format ein.</p>
              <p className="text-xs text-blue-200 font-mono bg-blue-950 bg-opacity-50 p-2 rounded">Spiel # → Datum → Name → Rolle → Win/Lose → Set → Team</p>
            </div>
            <textarea value={importData} onChange={(e) => setImportData(e.target.value)}
              placeholder={`Beispiel:\nSpiel #\tDatum\tName\tRolle\tWin / Lose\tSet\tTeam\n1\t14/03/2025\tHung\tMutant\tLose\tS&V\tGood`}
              className="w-full h-96 bg-gray-900 border border-gray-600 rounded-lg p-4 text-white font-mono text-sm focus:outline-none focus:border-purple-500" />
            {importError && (
              <div className="mt-4 p-4 bg-red-900 bg-opacity-30 border border-red-500 rounded-lg text-red-300 flex items-start gap-3">
                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                <div><p className="font-semibold mb-1">Fehler beim Import:</p><p className="text-sm">{importError}</p></div>
              </div>
            )}
            <div className="mt-6 flex gap-4">
              <button onClick={() => parseImportData(importData)} disabled={!importData.trim()} className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"><Upload size={20} />Daten importieren & speichern</button>
              <button onClick={clearStoredData} disabled={importedMatches.length === 0} className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors flex items-center gap-2"><Trash2 size={20} />Daten löschen</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center"><div className="text-6xl mb-4">🕐</div><p className="text-xl text-purple-300">Lade Daten...</p></div>
      </div>
    );
  }

  const leaderboardData = getLeaderboardData();
  const allScripts = getAvailableScripts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-4">
            <h1
              className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent cursor-default select-none"
              onClick={() => {
                const next = titleClicks + 1;
                setTitleClicks(next);
                if (next >= 5) { setShowImport(true); setTitleClicks(0); }
              }}
            >
              🕐 Blood on the Clocktower Stats
            </h1>
          </div>
          <p className="text-gray-400">Verfolge deine Spielerstatistiken und Erfolge</p>
          {importedMatches.length > 0 ? (
            <div className="flex items-center gap-4 mt-2">
              <p className="text-sm text-purple-300">✓ {importedMatches.length} Spiele geladen</p>
              {lastImportDate && <p className="text-xs text-gray-400">{lastImportDate}</p>}
            </div>
          ) : (
            <p className="text-sm text-yellow-300 mt-1">⚠️ Keine Spieldaten gefunden — bitte <code className="bg-gray-800 px-1 rounded">games.txt</code> im <code className="bg-gray-800 px-1 rounded">public/</code> Ordner ablegen.</p>
          )}
        </div>

        {/* Page Nav Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-700 pb-1">
          <button
            onClick={() => setActivePage('player')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-t-lg font-semibold text-sm transition-all ${activePage === 'player' ? 'bg-gray-800 text-purple-400 border border-b-0 border-gray-700' : 'text-gray-400 hover:text-white'}`}
          >
            <User size={16} />Spieler-Details
          </button>
          <button
            onClick={() => setActivePage('leaderboard')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-t-lg font-semibold text-sm transition-all ${activePage === 'leaderboard' ? 'bg-gray-800 text-purple-400 border border-b-0 border-gray-700' : 'text-gray-400 hover:text-white'}`}
          >
            <LayoutGrid size={16} />Spieler-Übersicht
          </button>
          <button
            onClick={() => setActivePage('hof')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-t-lg font-semibold text-sm transition-all ${activePage === 'hof' ? 'bg-gray-800 text-yellow-400 border border-b-0 border-gray-700' : 'text-gray-400 hover:text-white'}`}
          >
            <Trophy size={16} />Hall of Fame
          </button>
          <button
            onClick={() => setActivePage('roles')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-t-lg font-semibold text-sm transition-all ${activePage === 'roles' ? 'bg-gray-800 text-green-400 border border-b-0 border-gray-700' : 'text-gray-400 hover:text-white'}`}
          >
            <Users size={16} />Rollen-Stats
          </button>
          <button
            onClick={() => setActivePage('roleranking')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-t-lg font-semibold text-sm transition-all ${activePage === 'roleranking' ? 'bg-gray-800 text-orange-400 border border-b-0 border-gray-700' : 'text-gray-400 hover:text-white'}`}
          >
            <Award size={16} />Rollen-Ranking
          </button>
          <button
            onClick={() => setActivePage('session')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-t-lg font-semibold text-sm transition-all ${activePage === 'session' ? 'bg-gray-800 text-cyan-400 border border-b-0 border-gray-700' : 'text-gray-400 hover:text-white'}`}
          >
            <Calendar size={16} />Letzte Session
          </button>
        </div>

        {/* ======================== LEADERBOARD PAGE ======================== */}
        {activePage === 'leaderboard' && (
          <div>
            {/* Filters */}
            <div className="bg-gray-800 rounded-lg p-5 mb-6 border border-gray-700 space-y-4">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[180px]">
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium">Spieler suchen</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    <input type="text" placeholder="Name..." value={lbSearch} onChange={e => setLbSearch(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-600 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium flex items-center gap-1"><Calendar size={12} />Jahr</label>
                  <div className="flex gap-1 flex-wrap">
                    <button onClick={() => setLbSeason('all')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${lbSeason === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                      Alle
                    </button>
                    {getAvailableYears().map(y => (
                    <button key={y} onClick={() => { setLbSeason(y); setLbMinGames(5); }}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${lbSeason === y ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                        Season {y}
                      </button>
                    ))}
                  </div>
                </div>

                {allScripts.length > 1 && (
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-medium flex items-center gap-1"><Scroll size={12} />Script</label>
                    <select value={lbScript} onChange={e => setLbScript(e.target.value)}
                      className="bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500">
                      <option value="all">Alle Scripts</option>
                      {allScripts.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium flex items-center gap-1"><Shield size={12} />Team</label>
                  <div className="flex gap-1">
                    {[['all', 'Alle'], ['good', '💙 Gut'], ['evil', '❤️ Böse']].map(([val, label]) => (
                      <button key={val} onClick={() => setLbTeamFilter(val)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${lbTeamFilter === val ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium">Min. Spiele</label>
                  <input type="number" min={1} max={50} value={lbMinGames} onChange={e => setLbMinGames(parseInt(e.target.value) || 1)}
                    className="w-20 bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500" />
                </div>
              </div>

              <p className="text-xs text-gray-500">{leaderboardData.length} Spieler angezeigt • Klicke auf eine Spaltenüberschrift zum Sortieren</p>
            </div>

            {/* Table */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-900 border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium w-10">#</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">
                        <button className="flex items-center hover:text-white transition-colors" onClick={() => handleLbSort('name')}>
                          Spieler <SortIcon colKey="name" />
                        </button>
                      </th>
                      <th className="text-center py-3 px-4 text-gray-400 font-medium">
                        <button className="flex items-center mx-auto hover:text-white transition-colors" onClick={() => handleLbSort('total')}>
                          Spiele <SortIcon colKey="total" />
                        </button>
                      </th>
                      <th className="text-center py-3 px-4 text-gray-400 font-medium">
                        <button className="flex items-center mx-auto hover:text-white transition-colors" onClick={() => handleLbSort('wins')}>
                          Siege <SortIcon colKey="wins" />
                        </button>
                      </th>
                      <th className="text-center py-3 px-4">
                        <button className="flex items-center mx-auto hover:text-white transition-colors font-medium text-yellow-400" onClick={() => handleLbSort('winrate')}>
                          <Award size={14} className="mr-1" />Winrate <SortIcon colKey="winrate" />
                        </button>
                      </th>

                      {/* ── 💙 GUT: Spiele, Siege, Winrate ── */}
                      <th className="text-center py-3 px-2">
                        <button className="flex items-center mx-auto hover:text-white transition-colors font-medium text-blue-400" onClick={() => handleLbSort('goodGames')}>
                          💙 Sp. <SortIcon colKey="goodGames" />
                        </button>
                      </th>
                      <th className="text-center py-3 px-2">
                        <button className="flex items-center mx-auto hover:text-white transition-colors font-medium text-blue-300" onClick={() => handleLbSort('goodWins')}>
                          💙 Siege <SortIcon colKey="goodWins" />
                        </button>
                      </th>
                      <th className="text-center py-3 px-3">
                        <button className="flex items-center mx-auto hover:text-white transition-colors font-medium text-blue-400" onClick={() => handleLbSort('goodWinrate')}>
                          <Heart size={14} className="mr-1" />Gut WR <SortIcon colKey="goodWinrate" />
                        </button>
                      </th>

                      {/* ── ❤️ BÖSE: Spiele, Siege, Winrate ── */}
                      <th className="text-center py-3 px-2">
                        <button className="flex items-center mx-auto hover:text-white transition-colors font-medium text-red-400" onClick={() => handleLbSort('evilGames')}>
                          ❤️ Sp. <SortIcon colKey="evilGames" />
                        </button>
                      </th>
                      <th className="text-center py-3 px-2">
                        <button className="flex items-center mx-auto hover:text-white transition-colors font-medium text-red-300" onClick={() => handleLbSort('evilWins')}>
                          ❤️ Siege <SortIcon colKey="evilWins" />
                        </button>
                      </th>
                      <th className="text-center py-3 px-3">
                        <button className="flex items-center mx-auto hover:text-white transition-colors font-medium text-red-400" onClick={() => handleLbSort('evilWinrate')}>
                          <Skull size={14} className="mr-1" />Böse WR <SortIcon colKey="evilWinrate" />
                        </button>
                      </th>

                      <th className="text-center py-3 px-4 text-gray-400 font-medium text-xs">TB WR</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-medium text-xs">BMR WR</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-medium text-xs">S&V WR</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-medium">
                        <button className="flex items-center mx-auto hover:text-white transition-colors" onClick={() => handleLbSort('storytellerGames')}>
                          <BookOpen size={14} className="mr-1 text-purple-400" />ST <SortIcon colKey="storytellerGames" />
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboardData.map((player, idx) => {
                      const dispWinrate = lbTeamFilter === 'good' ? player.goodWinrate : lbTeamFilter === 'evil' ? player.evilWinrate : player.winrate;
                      return (
                        <tr key={player.id}
                          onClick={() => handlePlayerClick(player.name)}
                          className={`border-b border-gray-700 cursor-pointer transition-all hover:bg-purple-900 hover:bg-opacity-20 ${selectedPlayer?.name === player.name ? 'bg-purple-900 bg-opacity-30' : idx % 2 === 0 ? 'bg-gray-800' : 'bg-gray-850'}`}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center">{getRankIcon(idx + 1)}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{player.avatar}</span>
                              <span className="font-semibold text-white hover:text-purple-300 transition-colors">{player.name}</span>
                              {selectedPlayer?.name === player.name && <span className="text-xs bg-purple-600 px-2 py-0.5 rounded-full text-white">Aktiv</span>}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center font-mono">{player.total}</td>
                          <td className="py-3 px-4 text-center font-mono text-green-400">{player.wins}</td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className={`font-bold text-base ${dispWinrate > 50 ? 'text-green-400' : dispWinrate === 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                {dispWinrate}%
                              </span>
                              <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full transition-all ${dispWinrate > 50 ? 'bg-green-500' : dispWinrate === 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                  style={{ width: `${Math.min(dispWinrate, 100)}%` }} />
                              </div>
                            </div>
                          </td>

                          {/* 💙 GUT: Spiele */}
                          <td className="py-3 px-2 text-center">
                            {player.goodGames > 0
                              ? <span className="font-mono text-blue-300">{player.goodGames}</span>
                              : <span className="text-gray-600">—</span>}
                          </td>

                          {/* 💙 GUT: Siege */}
                          <td className="py-3 px-2 text-center">
                            {player.goodGames > 0 ? (
                              <div className="flex flex-col items-center gap-0.5">
                                <span className="font-bold text-blue-200">{player.goodWins}</span>
                                <span className="text-xs text-gray-500">{player.goodGames - player.goodWins}N</span>
                              </div>
                            ) : <span className="text-gray-600">—</span>}
                          </td>

                          {/* 💙 GUT: Winrate */}
                          <td className="py-3 px-3 text-center">
                            {player.goodGames > 0 ? (
                              <div className="flex flex-col items-center gap-1">
                                <span className={`font-bold ${player.goodWinrate >= 50 ? 'text-blue-300' : 'text-red-400'}`}>{player.goodWinrate}%</span>
                                <div className="w-14 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full ${player.goodWinrate >= 50 ? 'bg-blue-500' : 'bg-red-500'}`}
                                    style={{ width: `${Math.min(player.goodWinrate, 100)}%` }} />
                                </div>
                              </div>
                            ) : <span className="text-gray-600">—</span>}
                          </td>

                          {/* ❤️ BÖSE: Spiele */}
                          <td className="py-3 px-2 text-center">
                            {player.evilGames > 0
                              ? <span className="font-mono text-red-300">{player.evilGames}</span>
                              : <span className="text-gray-600">—</span>}
                          </td>

                          {/* ❤️ BÖSE: Siege */}
                          <td className="py-3 px-2 text-center">
                            {player.evilGames > 0 ? (
                              <div className="flex flex-col items-center gap-0.5">
                                <span className="font-bold text-red-200">{player.evilWins}</span>
                                <span className="text-xs text-gray-500">{player.evilGames - player.evilWins}N</span>
                              </div>
                            ) : <span className="text-gray-600">—</span>}
                          </td>

                          {/* ❤️ BÖSE: Winrate */}
                          <td className="py-3 px-3 text-center">
                            {player.evilGames > 0 ? (
                              <div className="flex flex-col items-center gap-1">
                                <span className={`font-bold ${player.evilWinrate >= 50 ? 'text-red-300' : 'text-gray-400'}`}>{player.evilWinrate}%</span>
                                <div className="w-14 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full ${player.evilWinrate >= 50 ? 'bg-red-500' : 'bg-gray-500'}`}
                                    style={{ width: `${Math.min(player.evilWinrate, 100)}%` }} />
                                </div>
                              </div>
                            ) : <span className="text-gray-600">—</span>}
                          </td>

                          {['Trouble Brewing','Bad Moon Rising','Sects and Violets'].map(sc => {
                            const s = player.scriptStats?.[sc];
                            return (
                              <td key={sc} className="py-3 px-4 text-center text-xs">
                                {s && s.games > 0 ? <div><span className={`font-semibold ${s.wr > 50 ? 'text-green-400' : s.wr === 50 ? 'text-yellow-400' : 'text-red-400'}`}>{s.wr}%</span><div className="text-gray-500">{s.games}Sp.</div></div> : <span className="text-gray-600">—</span>}
                              </td>
                            );
                          })}
                          <td className="py-3 px-4 text-center text-purple-300 font-mono">{player.storytellerGames}</td>
                        </tr>
                      );
                    })}
                    {leaderboardData.length === 0 && (
                      <tr><td colSpan={16} className="py-12 text-center text-gray-400">Keine Spieler gefunden mit den aktuellen Filtern.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary Cards */}
            {leaderboardData.length > 0 && (() => {
              const withStreaks = leaderboardData.map(p => ({
                ...p,
                ...calcStreaks(p.name, lbSeason, lbScript),
              }));

              const best = (arr, key) => [...arr].sort((a,b) => (b[key]??0)-(a[key]??0))[0];

              const topWr    = best(withStreaks, 'winrate');
              const topGames = best(withStreaks, 'total');
              const topGood  = withStreaks.filter(x=>x.goodGames>0).sort((a,b)=>b.goodWinrate-a.goodWinrate)[0];
              const topEvil  = withStreaks.filter(x=>x.evilGames>0).sort((a,b)=>b.evilWinrate-a.evilWinrate)[0];
              const topGoodWins = withStreaks.filter(x=>x.goodGames>0).sort((a,b)=>b.goodWins-a.goodWins)[0];
              const topEvilWins = withStreaks.filter(x=>x.evilGames>0).sort((a,b)=>b.evilWins-a.evilWins)[0];
              const topWinStreak     = best(withStreaks, 'maxWin');
              const topLoseStreak    = best(withStreaks, 'maxLose');
              const topGoodStreak    = best(withStreaks, 'maxGood');
              const topEvilStreak    = best(withStreaks, 'maxEvil');
              const topCurWinStreak  = [...withStreaks].filter(x => x.curWin  > 0).sort((a,b) => b.curWin  - a.curWin)[0];
              const topCurLoseStreak = [...withStreaks].filter(x => x.curLose > 0).sort((a,b) => b.curLose - a.curLose)[0];

              const cards = [
                { label: 'Höchste Winrate',           icon: <Award size={18} className="text-yellow-400" />,       val: topWr             ? `${topWr.name}: ${topWr.winrate}%`                                    : 'N/A',              accent: 'border-yellow-600' },
                { label: 'Meiste Spiele',              icon: <TrendingUp size={18} className="text-purple-400" />,  val: topGames          ? `${topGames.name}: ${topGames.total}`                                 : 'N/A',              accent: 'border-purple-600' },
                { label: 'Beste Gut-Winrate',          icon: <Heart size={18} className="text-blue-400" />,         val: topGood           ? `${topGood.name}: ${topGood.goodWinrate}%`                            : 'N/A',              accent: 'border-blue-600' },
                { label: 'Beste Böse-Winrate',         icon: <Skull size={18} className="text-red-400" />,          val: topEvil           ? `${topEvil.name}: ${topEvil.evilWinrate}%`                            : 'N/A',              accent: 'border-red-600' },
                { label: '💙 Meiste Gut-Siege',         icon: <Heart size={18} className="text-blue-300" />,         val: topGoodWins       ? `${topGoodWins.name}: ${topGoodWins.goodWins} Siege`                  : 'N/A',              accent: 'border-blue-400' },
                { label: '❤️ Meiste Böse-Siege',        icon: <Skull size={18} className="text-red-300" />,          val: topEvilWins       ? `${topEvilWins.name}: ${topEvilWins.evilWins} Siege`                  : 'N/A',              accent: 'border-red-400' },
                { label: '🔥 Longest Win Streak',       icon: <TrendingUp size={18} className="text-green-400" />,   val: topWinStreak      ? `${topWinStreak.name}: ${topWinStreak.maxWin} in Folge`               : 'N/A',              accent: 'border-green-600' },
                { label: '💀 Longest Lose Streak',      icon: <Skull size={18} className="text-orange-400" />,       val: topLoseStreak     ? `${topLoseStreak.name}: ${topLoseStreak.maxLose} in Folge`            : 'N/A',              accent: 'border-orange-600' },
                { label: '💙 Longest Good Streak',      icon: <Heart size={18} className="text-blue-300" />,         val: topGoodStreak     ? `${topGoodStreak.name}: ${topGoodStreak.maxGood} in Folge`            : 'N/A',              accent: 'border-blue-400' },
                { label: '❤️ Longest Evil Streak',      icon: <Skull size={18} className="text-red-300" />,          val: topEvilStreak     ? `${topEvilStreak.name}: ${topEvilStreak.maxEvil} in Folge`            : 'N/A',              accent: 'border-red-400' },
                { label: '⚡ Current Win Streak',        icon: <TrendingUp size={18} className="text-emerald-400" />, val: topCurWinStreak   ? `${topCurWinStreak.name}: ${topCurWinStreak.curWin} in Folge 🔥`       : 'Kein aktiver Streak', accent: 'border-emerald-500' },
                { label: '☠️ Current Lose Streak',       icon: <Skull size={18} className="text-rose-400" />,         val: topCurLoseStreak  ? `${topCurLoseStreak.name}: ${topCurLoseStreak.curLose} in Folge 💀`   : 'Kein aktiver Streak', accent: 'border-rose-500' },
              ];

              return (
                <div className="mt-6 space-y-3">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Highlights</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {cards.map((card, i) => (
                      <div key={i} className={`bg-gray-800 rounded-lg p-4 border border-l-4 border-gray-700 ${card.accent}`}>
                        <div className="flex items-center gap-2 mb-1.5">{card.icon}<span className="text-xs text-gray-400">{card.label}</span></div>
                        <p className="font-semibold text-sm text-white">{card.val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}



        {/* ======================== ROLES PAGE ======================== */}
        {activePage === 'roles' && (() => {
          const rolesData = getRolesData();
          const years = getAvailableYears();
          const allScriptsForRoles = getAvailableScripts();
          const _allRolesInData = getRolesData();
          const hasSonstige = _allRolesInData.some(r => r.category === 'Sonstige');
          const allCategories = Object.values(CATEGORY_DISPLAY)
            .filter(c => c.label !== 'Sonstige' || hasSonstige)
            .map(c => c.label);
          const handleRsSort = (key) => {
            if (rsSort === key) setRsSortDir(d => d === 'desc' ? 'asc' : 'desc');
            else { setRsSort(key); setRsSortDir('desc'); }
          };
          const RsSortIcon = ({ k }) => {
            if (rsSort !== k) return <ArrowUpDown size={13} className="text-gray-500 ml-1 inline" />;
            return rsSortDir === 'desc'
              ? <ArrowDown size={13} className="text-green-400 ml-1 inline" />
              : <ArrowUp size={13} className="text-green-400 ml-1 inline" />;
          };

          return (
            <div>
              <div className="bg-gray-800 rounded-lg p-5 mb-6 border border-gray-700 space-y-4">
                <div className="flex flex-wrap gap-4 items-end">
                  <div className="flex-1 min-w-[160px]">
                    <label className="block text-xs text-gray-400 mb-1.5 font-medium">Rolle suchen</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 text-gray-400" size={15} />
                      <input type="text" placeholder="z.B. Imp..." value={rsSearch} onChange={e => setRsSearch(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-medium">Team</label>
                    <div className="flex gap-1">
                      {[['all','Alle'],['good','💙 Gut'],['evil','❤️ Böse']].map(([v,l]) => (
                        <button key={v} onClick={() => setRsTeam(v)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${rsTeam === v ? 'bg-green-700 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>{l}</button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium">Min. Spiele</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 5, 10].map(n => (
                      <button key={n} onClick={() => setRsMinGames(n)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${rsMinGames === n ? 'bg-green-700 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                        {n}+
                      </button>
                    ))}
                    <input type="number" min={1} max={999} value={rsMinGames} onChange={e => setRsMinGames(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium flex items-center gap-1"><Calendar size={12} />Jahr</label>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setRsSeason('all')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${rsSeason === 'all' ? 'bg-green-700 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>Alle</button>
                    {years.map(y => (
                      <button key={y} onClick={() => setRsSeason(y)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${rsSeason === y ? 'bg-green-700 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>Season {y}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium flex items-center gap-1"><Scroll size={12} />Script</label>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setRsScript('all')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${rsScript === 'all' ? 'bg-green-700 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>Alle Scripts</button>
                    {allScriptsForRoles.map(s => (
                      <button key={s} onClick={() => setRsScript(s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${rsScript === s ? 'bg-green-700 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>{s}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium">Kategorie</label>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setRsCategory('all')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${rsCategory === 'all' ? 'bg-green-700 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>Alle</button>
                    {allCategories.map(cat => {
                      const cfg = Object.values(CATEGORY_DISPLAY).find(c => c.label === cat);
                      return (
                        <button key={cat} onClick={() => setRsCategory(cat)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${rsCategory === cat ? 'text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                          style={rsCategory === cat ? { backgroundColor: cfg?.color + 'cc' } : {}}>
                          {cfg?.emoji} {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <p className="text-xs text-gray-500">{rolesData.length} Rollen gefunden</p>
              </div>

              {/* ── Global Highlights (collapsible) ── */}
              {(() => {
                const { mostPlayed, mostPlayedGood, mostPlayedEvil, bestWR, worstWR, bestGoodWR, bestEvilWR, mostDiversePlayers, mostWins, mostLosses, bestCat, worstCat } = getRSHighlightsData();

                const W = ({ r }) => r
                  ? <><span className="font-bold text-white">{r.role}</span><span className="font-bold ml-1.5 text-green-400">{r.winrate}%</span><span className="text-xs text-gray-500 ml-1">({r.wins}S/{r.losses}N, {r.games} Sp.)</span></>
                  : <span className="text-gray-500">—</span>;

                const hlCards = [
                  { icon: '📊', accent: 'border-purple-500', label: 'Meist gespielte Rolle',          content: mostPlayed         ? <><span className="font-bold text-white">{mostPlayed.role}</span><span className="text-gray-300"> — {mostPlayed.games}× gespielt</span><span className="text-xs text-gray-500 ml-1">({mostPlayed.wins}S/{mostPlayed.losses}N)</span></> : <span className="text-gray-500">—</span> },
                  { icon: '💙', accent: 'border-blue-500',   label: 'Meist gespielte Gut-Rolle',      content: mostPlayedGood     ? <><span className="font-bold text-white">{mostPlayedGood.role}</span><span className="text-gray-300"> — {mostPlayedGood.games}× gespielt</span></> : <span className="text-gray-500">—</span> },
                  { icon: '❤️', accent: 'border-red-500',    label: 'Meist gespielte Böse-Rolle',     content: mostPlayedEvil     ? <><span className="font-bold text-white">{mostPlayedEvil.role}</span><span className="text-gray-300"> — {mostPlayedEvil.games}× gespielt</span></> : <span className="text-gray-500">—</span> },
                  { icon: '⭐', accent: 'border-green-500',  label: 'Höchste Winrate (3+ Sp.)',       content: <W r={bestWR} /> },
                  { icon: '💀', accent: 'border-rose-500',   label: 'Niedrigste Winrate (3+ Sp.)',    content: <W r={worstWR} /> },
                  { icon: '💙', accent: 'border-cyan-500',   label: 'Beste Gut-Rolle (3+ Sp.)',       content: <W r={bestGoodWR} /> },
                  { icon: '😈', accent: 'border-orange-500', label: 'Beste Böse-Rolle (3+ Sp.)',      content: <W r={bestEvilWR} /> },
                  { icon: '🏆', accent: 'border-yellow-500', label: 'Meiste Siege (1 Rolle)',         content: mostWins           ? <><span className="font-bold text-white">{mostWins.role}</span><span className="font-bold text-yellow-300 ml-1.5">{mostWins.wins} Siege</span><span className="text-xs text-gray-500 ml-1">({mostWins.games} Sp.)</span></> : <span className="text-gray-500">—</span> },
                  { icon: '😤', accent: 'border-red-700',    label: 'Meiste Niederlagen (1 Rolle)',   content: mostLosses         ? <><span className="font-bold text-white">{mostLosses.role}</span><span className="font-bold text-red-400 ml-1.5">{mostLosses.losses} Niederlagen</span><span className="text-xs text-gray-500 ml-1">({mostLosses.games} Sp.)</span></> : <span className="text-gray-500">—</span> },
                  { icon: '👥', accent: 'border-indigo-500', label: 'Rolle von meisten Spielern',     content: mostDiversePlayers ? <><span className="font-bold text-white">{mostDiversePlayers.role}</span><span className="text-gray-300"> von </span><span className="font-bold text-indigo-300">{mostDiversePlayers.players} Spielern</span><span className="text-gray-300"> gespielt</span></> : <span className="text-gray-500">—</span> },
                  { icon: '🥇', accent: 'border-emerald-500',label: 'Beste Kategorie (5+ Sp.)',      content: bestCat            ? <><span className="font-bold" style={{color: CATEGORY_DISPLAY[bestCat.key]?.color ?? '#fff'}}>{bestCat.emoji} {bestCat.label}</span><span className="font-bold text-green-400 ml-1.5">{bestCat.winrate}%</span><span className="text-xs text-gray-500 ml-1">({bestCat.games} Sp.)</span></> : <span className="text-gray-500">—</span> },
                  { icon: '😰', accent: 'border-amber-500',  label: 'Schwächste Kategorie (5+ Sp.)', content: worstCat           ? <><span className="font-bold" style={{color: CATEGORY_DISPLAY[worstCat.key]?.color ?? '#fff'}}>{worstCat.emoji} {worstCat.label}</span><span className="font-bold text-red-400 ml-1.5">{worstCat.winrate}%</span><span className="text-xs text-gray-500 ml-1">({worstCat.games} Sp.)</span></> : <span className="text-gray-500">—</span> },
                ];

                return (
                  <div className="mb-6">
                    <button
                      onClick={() => setRsShowHighlights(v => !v)}
                      className="w-full flex items-center justify-between px-5 py-3 bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-750 transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <Award size={16} className="text-green-400" />
                        <span className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors">Globale Highlights</span>
                        <span className="text-xs text-gray-500">— Rekorde über alle Rollen</span>
                      </div>
                      {rsShowHighlights ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                    </button>
                    {rsShowHighlights && (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mt-3">
                        {hlCards.map((card, i) => (
                          <div key={i} className={`bg-gray-800 rounded-xl border border-gray-700 border-l-4 ${card.accent} p-4`}>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">{card.icon}</span>
                              <span className="text-xs text-gray-400 font-medium">{card.label}</span>
                            </div>
                            <p className="text-sm leading-relaxed">{card.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* ── Role Synergy Analysis (collapsible) ── */}
              {(() => {
                const synergies = getRoleSynergyData(rsAnalysisMinGames);
                const goodSynergies = synergies.filter(p => p.team === 'Gut' || synergies.find(s => s.role1 === p.role1 && s.role2 === p.role2));
                const top = synergies.slice(0, 20);
                const topStrong = synergies.filter(p => p.winrate > 50).slice(0, 10);
                const topWeak   = [...synergies].sort((a,b) => a.winrate - b.winrate || b.games - a.games).slice(0, 5);
                const topFreq   = [...synergies].sort((a,b) => b.games - a.games).slice(0, 5);

                const RoleBadge = ({ role }) => {
                  const cfg = CATEGORY_DISPLAY[getRoleCategory(role)] || CATEGORY_DISPLAY.Sonstige;
                  return (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: cfg.color + '22', color: cfg.color }}>
                      {cfg.emoji} {role}
                    </span>
                  );
                };

                const WrBar = ({ wr }) => (
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${wr > 50 ? 'bg-green-500' : wr === 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${wr}%` }} />
                    </div>
                    <span className={`text-xs font-bold w-10 text-right ${wr > 50 ? 'text-green-400' : wr === 50 ? 'text-yellow-400' : 'text-red-400'}`}>{wr}%</span>
                  </div>
                );

                return (
                  <div className="mb-6">
                    <button
                      onClick={() => setRsShowAnalysis(v => !v)}
                      className="w-full flex items-center justify-between px-5 py-3 bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-750 transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">🔬</span>
                        <span className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors">Rollen-Synergie Analyse</span>
                        <span className="text-xs text-gray-500">— Welche Rollen-Kombinationen sind stark/schwach?</span>
                      </div>
                      {rsShowAnalysis ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                    </button>

                    {rsShowAnalysis && (
                      <div className="mt-3 space-y-5">
                        {/* Min games filter */}
                        <div className="flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3">
                          <span className="text-xs text-gray-400 font-medium">Min. gemeinsame Spiele:</span>
                          <div className="flex gap-1.5">
                            {[2, 3, 5, 8].map(n => (
                              <button key={n} onClick={() => setRsAnalysisMinGames(n)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${rsAnalysisMinGames === n ? 'bg-green-700 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                                {n}+
                              </button>
                            ))}
                          </div>
                          <span className="text-xs text-gray-500 ml-2">{synergies.length} Paare gefunden</span>
                        </div>

                        {synergies.length === 0 ? (
                          <div className="text-center py-8 text-gray-500 bg-gray-800 rounded-xl border border-gray-700">
                            <p>Keine Paare mit {rsAnalysisMinGames}+ gemeinsamen Spielen gefunden.</p>
                            <p className="text-xs mt-1">Versuche einen niedrigeren Mindestwert.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                            {/* Stärkste Kombinationen */}
                            <div className="bg-gray-800 rounded-xl border border-green-800 overflow-hidden">
                              <div className="px-4 py-3 bg-green-900 bg-opacity-30 border-b border-green-800 flex items-center gap-2">
                                <span className="text-base">💪</span>
                                <span className="text-sm font-bold text-green-300">Stärkste Kombinationen</span>
                              </div>
                              <div className="divide-y divide-gray-700">
                                {topStrong.length === 0 ? (
                                  <p className="px-4 py-4 text-xs text-gray-500">Keine Kombination mit ≥60% WR</p>
                                ) : topStrong.map((p, i) => (
                                  <div key={i} className="px-4 py-3">
                                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                      <RoleBadge role={p.role1} />
                                      <span className="text-gray-500 text-xs">+</span>
                                      <RoleBadge role={p.role2} />
                                    </div>
                                    <WrBar wr={p.winrate} />
                                    <div className="text-xs text-gray-500 mt-1">{p.wins}S / {p.losses}N · {p.games} Sp. zusammen</div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Schwächste Kombinationen */}
                            <div className="bg-gray-800 rounded-xl border border-red-900 overflow-hidden">
                              <div className="px-4 py-3 bg-red-900 bg-opacity-20 border-b border-red-900 flex items-center gap-2">
                                <span className="text-base">💀</span>
                                <span className="text-sm font-bold text-red-300">Schwächste Kombinationen</span>
                              </div>
                              <div className="divide-y divide-gray-700">
                                {topWeak.map((p, i) => (
                                  <div key={i} className="px-4 py-3">
                                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                      <RoleBadge role={p.role1} />
                                      <span className="text-gray-500 text-xs">+</span>
                                      <RoleBadge role={p.role2} />
                                    </div>
                                    <WrBar wr={p.winrate} />
                                    <div className="text-xs text-gray-500 mt-1">{p.wins}S / {p.losses}N · {p.games} Sp. zusammen</div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Häufigste Kombinationen */}
                            <div className="bg-gray-800 rounded-xl border border-purple-900 overflow-hidden">
                              <div className="px-4 py-3 bg-purple-900 bg-opacity-20 border-b border-purple-900 flex items-center gap-2">
                                <span className="text-base">🔁</span>
                                <span className="text-sm font-bold text-purple-300">Häufigste Kombinationen</span>
                              </div>
                              <div className="divide-y divide-gray-700">
                                {topFreq.map((p, i) => (
                                  <div key={i} className="px-4 py-3">
                                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                      <RoleBadge role={p.role1} />
                                      <span className="text-gray-500 text-xs">+</span>
                                      <RoleBadge role={p.role2} />
                                    </div>
                                    <WrBar wr={p.winrate} />
                                    <div className="text-xs text-gray-500 mt-1">{p.wins}S / {p.losses}N · {p.games} Sp. zusammen</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Full table */}
                        {top.length > 0 && (
                          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-700 flex items-center gap-2">
                              <span className="text-base">📋</span>
                              <span className="text-sm font-bold text-white">Alle Paare</span>
                              <span className="text-xs text-gray-500">sortiert nach Winrate</span>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="bg-gray-900 border-b border-gray-700 text-xs text-gray-400">
                                    <th className="text-left py-2.5 px-4">#</th>
                                    <th className="text-left py-2.5 px-4">Kombination</th>
                                    <th className="text-center py-2.5 px-4">Spiele</th>
                                    <th className="text-center py-2.5 px-4 text-green-400">Siege</th>
                                    <th className="text-center py-2.5 px-4 text-red-400">Niederl.</th>
                                    <th className="text-center py-2.5 px-4 text-yellow-400">Winrate</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {top.map((p, i) => (
                                    <tr key={i} className={`border-b border-gray-700 ${i % 2 === 0 ? 'bg-gray-800' : ''}`}>
                                      <td className="py-2.5 px-4 text-gray-500 text-xs">{i + 1}</td>
                                      <td className="py-2.5 px-4">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <RoleBadge role={p.role1} />
                                          <span className="text-gray-500 text-xs">+</span>
                                          <RoleBadge role={p.role2} />
                                        </div>
                                      </td>
                                      <td className="py-2.5 px-4 text-center font-mono text-gray-300">{p.games}</td>
                                      <td className="py-2.5 px-4 text-center font-mono text-green-400">{p.wins}</td>
                                      <td className="py-2.5 px-4 text-center font-mono text-red-400">{p.losses}</td>
                                      <td className="py-2.5 px-4 text-center">
                                        <span className={`font-bold ${p.winrate > 50 ? 'text-green-400' : p.winrate === 50 ? 'text-yellow-400' : 'text-red-400'}`}>{p.winrate}%</span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              {rolesData.length > 0 && (() => {
                const totalGames = rolesData.reduce((s, r) => s + r.games, 0);
                const mostPlayed = [...rolesData].sort((a,b) => b.games - a.games)[0];
                const bestWr = [...rolesData].filter(r => r.games >= 3).sort((a,b) => b.winrate - a.winrate)[0];
                const worstWr = [...rolesData].filter(r => r.games >= 3).sort((a,b) => a.winrate - b.winrate)[0];
                const filteredWins = rolesData.reduce((s, r) => s + r.wins, 0);
                const filteredWr = totalGames > 0 ? parseFloat(((filteredWins / totalGames) * 100).toFixed(1)) : 0;
                const catKey = rsCategory !== 'all' ? Object.keys(CATEGORY_DISPLAY).find(k => CATEGORY_DISPLAY[k].label === rsCategory) : null;
                const catCfg = catKey ? CATEGORY_DISPLAY[catKey] : null;

                return (
                  <div className="space-y-4 mb-6">
                    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 flex flex-wrap items-center gap-6"
                      style={catCfg ? {borderLeftColor: catCfg.color, borderLeftWidth: 4} : {}}>
                      <div>
                        <div className="text-xs text-gray-400 mb-0.5">{catCfg ? `${catCfg.emoji} ${catCfg.label}` : 'Alle Kategorien'}</div>
                        <div className={`text-3xl font-black ${filteredWr > 50 ? 'text-green-400' : filteredWr === 50 ? 'text-yellow-400' : 'text-red-400'}`}>{filteredWr}%</div>
                      </div>
                      <div className="text-sm text-gray-300">
                        <span className="text-green-400 font-semibold">{filteredWins}S</span>
                        <span className="text-gray-500 mx-1">/</span>
                        <span className="text-red-400 font-semibold">{totalGames - filteredWins}N</span>
                        <span className="text-gray-500 ml-2">({totalGames} Spiele)</span>
                      </div>
                      <div className="flex-1 min-w-[120px]">
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" style={{width: `${filteredWr}%`}} />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { icon: <TrendingUp size={18} className="text-purple-400"/>, label: 'Spiele gesamt', val: totalGames },
                        { icon: <Users size={18} className="text-blue-400"/>, label: 'Meist gespielt', val: mostPlayed ? `${mostPlayed.role} (${mostPlayed.games}×)` : '—' },
                        { icon: <Award size={18} className="text-green-400"/>, label: 'Höchste WR (3+ Sp.)', val: bestWr ? `${bestWr.role}: ${bestWr.winrate}%` : '—' },
                        { icon: <Skull size={18} className="text-red-400"/>, label: 'Niedrigste WR (3+ Sp.)', val: worstWr ? `${worstWr.role}: ${worstWr.winrate}%` : '—' },
                      ].map((c,i) => (
                        <div key={i} className="bg-gray-800 rounded-lg p-3 border border-gray-700 flex items-start gap-3">
                          <div className="mt-0.5">{c.icon}</div>
                          <div>
                            <div className="text-xs text-gray-400 mb-0.5">{c.label}</div>
                            <div className="font-semibold text-sm text-white">{c.val}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-900 border-b border-gray-700">
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">
                          <button className="flex items-center hover:text-white" onClick={() => handleRsSort('name')}>Rolle <RsSortIcon k="name" /></button>
                        </th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Kategorie</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Team</th>
                        <th className="text-center py-3 px-4 text-gray-400 font-medium">
                          <button className="flex items-center mx-auto hover:text-white" onClick={() => handleRsSort('games')}>Gespielt <RsSortIcon k="games" /></button>
                        </th>
                        <th className="text-center py-3 px-4 text-gray-400 font-medium">
                          <button className="flex items-center mx-auto hover:text-white" onClick={() => handleRsSort('wins')}>Siege <RsSortIcon k="wins" /></button>
                        </th>
                        <th className="text-center py-3 px-4 text-gray-400 font-medium">Niederl.</th>
                        <th className="text-center py-3 px-4">
                          <button className="flex items-center mx-auto hover:text-white font-medium text-green-400" onClick={() => handleRsSort('winrate')}>
                            <Award size={13} className="mr-1"/>Winrate <RsSortIcon k="winrate" />
                          </button>
                        </th>
                        <th className="text-center py-3 px-4 text-gray-400 font-medium">
                          <button className="flex items-center mx-auto hover:text-white" onClick={() => handleRsSort('players')}>Spieler <RsSortIcon k="players" /></button>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rolesData.map((row, idx) => {
                        const catKey = Object.keys(CATEGORY_DISPLAY).find(k => k === row.category);
                        const catCfg = catKey ? CATEGORY_DISPLAY[catKey] : CATEGORY_DISPLAY.Sonstige;
                        return (
                          <tr key={row.role} className={`border-b border-gray-700 transition-colors hover:bg-gray-700 ${idx % 2 === 0 ? 'bg-gray-800' : 'bg-gray-850'}`}>
                            <td className="py-3 px-4 font-semibold text-white">{row.role}</td>
                            <td className="py-3 px-4">
                              <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: catCfg.color + '33', color: catCfg.color }}>
                                {catCfg.emoji} {catCfg.label}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${row.team === 'Böse' ? 'bg-red-900 bg-opacity-60 text-red-300' : 'bg-blue-900 bg-opacity-60 text-blue-300'}`}>
                                {row.team === 'Böse' ? '❤️ Böse' : '💙 Gut'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center font-mono">{row.games}</td>
                            <td className="py-3 px-4 text-center font-mono text-green-400">{row.wins}</td>
                            <td className="py-3 px-4 text-center font-mono text-red-400">{row.losses}</td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex flex-col items-center gap-1">
                                <span className={`font-bold ${row.winrate > 50 ? 'text-green-400' : row.winrate === 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                  {row.winrate}%
                                </span>
                                <div className="w-14 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full ${row.winrate > 50 ? 'bg-green-500' : row.winrate === 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                    style={{ width: `${row.winrate}%` }} />
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center text-gray-300 font-mono">{row.players}</td>
                          </tr>
                        );
                      })}
                      {rolesData.length === 0 && (
                        <tr><td colSpan={8} className="py-12 text-center text-gray-400">Keine Rollen gefunden.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })()}


        {/* ======================== ROLLEN-RANKING PAGE ======================== */}
        {activePage === 'roleranking' && (() => {
          const { rows, allRoles } = getRoleRankingData();
          const years = getAvailableYears();
          const allScriptsRR = getAvailableScripts();
          const medals = ['🥇','🥈','🥉'];

          const handleRrSort = (key) => {
            if (rrSort === key) setRrSortDir(d => d === 'desc' ? 'asc' : 'desc');
            else { setRrSort(key); setRrSortDir('desc'); }
          };
          const RrSortIcon = ({ k }) => {
            if (rrSort !== k) return <ArrowUpDown size={13} className="text-gray-500 ml-1 inline" />;
            return rrSortDir === 'desc'
              ? <ArrowDown size={13} className="text-orange-400 ml-1 inline" />
              : <ArrowUp size={13} className="text-orange-400 ml-1 inline" />;
          };

          return (
            <div>
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-5 mb-6 space-y-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-medium">Ansicht</label>
                    <div className="flex gap-1">
                      <button onClick={() => { setRrMode('role'); setRrSelected(null); }}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${rrMode === 'role' ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                        🎭 Einzelne Rolle
                      </button>
                      <button onClick={() => { setRrMode('category'); setRrSelected(null); }}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${rrMode === 'category' ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                        🏷️ Kategorie
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-medium">Team</label>
                    <div className="flex gap-1">
                      {[['all','Alle'],['good','💙 Gut'],['evil','❤️ Böse']].map(([v,l]) => (
                        <button key={v} onClick={() => { setRrTeam(v); setRrSelected(null); }}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${rrTeam === v ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>{l}</button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-medium">Min. Spiele</label>
                    <div className="flex gap-1 items-center">
                      {[1,2,3,5,10].map(n => (
                        <button key={n} onClick={() => setRrMinGames(n)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${rrMinGames === n ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                          {n}+
                        </button>
                      ))}
                      <input type="number" min={1} max={999} value={rrMinGames}
                        onChange={e => setRrMinGames(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-16 ml-1 bg-gray-900 border border-gray-600 rounded-lg px-2 py-2 text-sm text-white focus:outline-none focus:border-orange-500" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium flex items-center gap-1"><Calendar size={12}/>Jahr</label>
                  <div className="flex gap-2 flex-wrap">
                    {['all', ...years].map(y => (
                      <button key={y} onClick={() => setRrSeason(y)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${rrSeason === y ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                        {y === 'all' ? 'Alle' : `Season ${y}`}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium flex items-center gap-1"><Scroll size={12}/>Script</label>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setRrScript('all')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${rrScript === 'all' ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                      Alle Scripts
                    </button>
                    {allScriptsRR.map(s => (
                      <button key={s} onClick={() => setRrScript(s)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${rrScript === s ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-gray-500">
                  {rrSelected
                    ? `${rows.length} Spieler mit ${rrMinGames}+ Spielen qualifiziert`
                    : `Wähle ${rrMode === 'role' ? 'eine Rolle' : 'eine Kategorie'} aus der Liste unten`}
                </p>
              </div>

              {/* ── Mode-specific Highlights (collapsible) ── */}
              {(() => {
                const hl = getRRHighlightsData();
                const isRole = rrMode === 'role';

                // ── Role mode cards ──
                const roleCards = [
                  { icon: '🎭', accent: 'border-orange-500', label: 'Meiste Spiele mit 1 Rolle',
                    content: hl.mostGames ? <><span className="font-bold text-white">{hl.mostGames.player}</span><span className="text-gray-300"> spielte </span><span className="font-bold text-orange-300">{hl.mostGames.role}</span><span className="text-gray-300"> {hl.mostGames.games}× </span><span className="text-xs text-gray-500">({hl.mostGames.wins}S/{hl.mostGames.losses}N)</span></> : <span className="text-gray-500">—</span> },
                  { icon: '🏆', accent: 'border-yellow-500', label: 'Meiste Siege mit 1 Rolle',
                    content: hl.mostWins ? <><span className="font-bold text-white">{hl.mostWins.player}</span><span className="text-gray-300"> gewann </span><span className="font-bold text-yellow-300">{hl.mostWins.wins}×</span><span className="text-gray-300"> als </span><span className="font-bold text-orange-300">{hl.mostWins.role}</span><span className="text-xs text-gray-500 ml-1">({hl.mostWins.games} Sp.)</span></> : <span className="text-gray-500">—</span> },
                  { icon: '⭐', accent: 'border-green-500', label: 'Beste Winrate (1 Rolle, 3+ Sp.)',
                    content: hl.bestWR ? <><span className="font-bold text-white">{hl.bestWR.player}</span><span className="text-gray-300"> als </span><span className="font-bold text-orange-300">{hl.bestWR.role}</span><span className="font-bold text-green-400 ml-1">{hl.bestWR.winrate}%</span><span className="text-xs text-gray-500 ml-1">({hl.bestWR.wins}S/{hl.bestWR.losses}N)</span></> : <span className="text-gray-500">—</span> },
                  { icon: '💀', accent: 'border-red-500', label: 'Schlechteste Winrate (1 Rolle, 3+ Sp.)',
                    content: hl.worstWR ? <><span className="font-bold text-white">{hl.worstWR.player}</span><span className="text-gray-300"> als </span><span className="font-bold text-orange-300">{hl.worstWR.role}</span><span className="font-bold text-red-400 ml-1">{hl.worstWR.winrate}%</span><span className="text-xs text-gray-500 ml-1">({hl.worstWR.wins}S/{hl.worstWR.losses}N)</span></> : <span className="text-gray-500">—</span> },
                  { icon: '😤', accent: 'border-rose-500', label: 'Meiste Niederlagen mit 1 Rolle',
                    content: hl.mostLosses ? <><span className="font-bold text-white">{hl.mostLosses.player}</span><span className="text-gray-300"> verlor </span><span className="font-bold text-rose-300">{hl.mostLosses.losses}×</span><span className="text-gray-300"> als </span><span className="font-bold text-orange-300">{hl.mostLosses.role}</span><span className="text-xs text-gray-500 ml-1">({hl.mostLosses.games} Sp.)</span></> : <span className="text-gray-500">—</span> },
                  { icon: '🎲', accent: 'border-purple-500', label: 'Meiste verschiedene Rollen gespielt',
                    content: hl.mostDiverse ? <><span className="font-bold text-white">{hl.mostDiverse.name}</span><span className="text-gray-300"> hat </span><span className="font-bold text-purple-300">{hl.mostDiverse.count} verschiedene Rollen</span><span className="text-gray-300"> gespielt</span></> : <span className="text-gray-500">—</span> },
                  { icon: '🔒', accent: 'border-cyan-500', label: 'Größter Rollen-Loyalist (5+ Sp.)',
                    content: hl.loyalist ? <><span className="font-bold text-white">{hl.loyalist.player}</span><span className="text-gray-300"> spielte </span><span className="font-bold text-cyan-300">{hl.loyalist.pct}%</span><span className="text-gray-300"> seiner Spiele als </span><span className="font-bold text-orange-300">{hl.loyalist.role}</span><span className="text-xs text-gray-500 ml-1">({hl.loyalist.games}×)</span></> : <span className="text-gray-500">—</span> },
                ];

                // ── Category mode cards ──
                const CatName = ({ c }) => c ? <span className="font-bold" style={{color: c.color}}>{c.emoji} {c.label}</span> : null;
                const catCards = [
                  { icon: '📊', accent: 'border-orange-500', label: 'Meiste Spiele in 1 Kategorie',
                    content: hl.catMostGames ? <><span className="font-bold text-white">{hl.catMostGames.player}</span><span className="text-gray-300"> spielte </span><span className="font-bold text-orange-300">{hl.catMostGames.games}×</span><span className="text-gray-300"> in </span><CatName c={hl.catMostGames} /><span className="text-xs text-gray-500 ml-1">({hl.catMostGames.wins}S/{hl.catMostGames.losses}N)</span></> : <span className="text-gray-500">—</span> },
                  { icon: '🏆', accent: 'border-yellow-500', label: 'Meiste Siege in 1 Kategorie',
                    content: hl.catMostWins ? <><span className="font-bold text-white">{hl.catMostWins.player}</span><span className="text-gray-300"> gewann </span><span className="font-bold text-yellow-300">{hl.catMostWins.wins}×</span><span className="text-gray-300"> in </span><CatName c={hl.catMostWins} /><span className="text-xs text-gray-500 ml-1">({hl.catMostWins.games} Sp.)</span></> : <span className="text-gray-500">—</span> },
                  { icon: '⭐', accent: 'border-green-500', label: 'Beste Winrate in 1 Kategorie (3+ Sp.)',
                    content: hl.catBestWR ? <><span className="font-bold text-white">{hl.catBestWR.player}</span><span className="text-gray-300"> in </span><CatName c={hl.catBestWR} /><span className="font-bold text-green-400 ml-1">{hl.catBestWR.winrate}%</span><span className="text-xs text-gray-500 ml-1">({hl.catBestWR.wins}S/{hl.catBestWR.losses}N)</span></> : <span className="text-gray-500">—</span> },
                  { icon: '💀', accent: 'border-red-500', label: 'Schlechteste Winrate in 1 Kategorie (3+ Sp.)',
                    content: hl.catWorstWR ? <><span className="font-bold text-white">{hl.catWorstWR.player}</span><span className="text-gray-300"> in </span><CatName c={hl.catWorstWR} /><span className="font-bold text-red-400 ml-1">{hl.catWorstWR.winrate}%</span><span className="text-xs text-gray-500 ml-1">({hl.catWorstWR.wins}S/{hl.catWorstWR.losses}N)</span></> : <span className="text-gray-500">—</span> },
                  { icon: '😤', accent: 'border-rose-500', label: 'Meiste Niederlagen in 1 Kategorie',
                    content: hl.catMostLosses ? <><span className="font-bold text-white">{hl.catMostLosses.player}</span><span className="text-gray-300"> verlor </span><span className="font-bold text-rose-300">{hl.catMostLosses.losses}×</span><span className="text-gray-300"> in </span><CatName c={hl.catMostLosses} /><span className="text-xs text-gray-500 ml-1">({hl.catMostLosses.games} Sp.)</span></> : <span className="text-gray-500">—</span> },
                  { icon: '🎲', accent: 'border-purple-500', label: 'Meiste verschiedene Kategorien gespielt',
                    content: hl.catMostDiverse ? <><span className="font-bold text-white">{hl.catMostDiverse.name}</span><span className="text-gray-300"> spielte in </span><span className="font-bold text-purple-300">{hl.catMostDiverse.count} verschiedenen Kategorien</span></> : <span className="text-gray-500">—</span> },
                  { icon: '🔒', accent: 'border-cyan-500', label: 'Größter Kategorie-Loyalist (5+ Sp.)',
                    content: hl.catLoyalist ? <><span className="font-bold text-white">{hl.catLoyalist.player}</span><span className="text-gray-300"> spielte </span><span className="font-bold text-cyan-300">{hl.catLoyalist.pct}%</span><span className="text-gray-300"> seiner Spiele in </span><CatName c={hl.catLoyalist} /><span className="text-xs text-gray-500 ml-1">({hl.catLoyalist.games}×)</span></> : <span className="text-gray-500">—</span> },
                ];

                const cards    = isRole ? roleCards : catCards;
                const subtitle = isRole ? '— Rekorde über alle Rollen & Spieler' : '— Rekorde über alle Kategorien & Spieler';

                return (
                  <div className="mb-6">
                    <button
                      onClick={() => setRrShowHighlights(v => !v)}
                      className="w-full flex items-center justify-between px-5 py-3 bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-750 transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <Award size={16} className="text-orange-400" />
                        <span className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors">
                          Globale Highlights {isRole ? '🎭 Einzelne Rolle' : '🏷️ Kategorie'}
                        </span>
                        <span className="text-xs text-gray-500">{subtitle}</span>
                      </div>
                      {rrShowHighlights ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                    </button>
                    {rrShowHighlights && (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mt-3">
                        {cards.map((card, i) => (
                          <div key={i} className={`bg-gray-800 rounded-xl border border-gray-700 border-l-4 ${card.accent} p-4`}>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">{card.icon}</span>
                              <span className="text-xs text-gray-400 font-medium">{card.label}</span>
                            </div>
                            <p className="text-sm leading-relaxed">{card.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="flex gap-6">
                <div className="w-56 flex-shrink-0">
                  <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden sticky top-4">
                    <div className="px-3 py-2.5 border-b border-gray-700 text-xs text-gray-400 font-semibold uppercase tracking-wide">
                      {rrMode === 'role' ? `${allRoles.length} Rollen` : 'Kategorien'}
                    </div>
                    <div className="overflow-y-auto max-h-[560px]">
                      {rrMode === 'role' ? (
                        allRoles.map(role => {
                          const catKey = getRoleCategory(role);
                          const cfg = CATEGORY_DISPLAY[catKey] || CATEGORY_DISPLAY.Sonstige;
                          return (
                            <button key={role} onClick={() => setRrSelected(role)}
                              className={`w-full text-left px-3 py-2.5 text-sm transition-colors flex items-center gap-2 border-b border-gray-700 last:border-0 ${rrSelected === role ? 'bg-orange-700 bg-opacity-40 text-orange-200 font-semibold' : 'hover:bg-gray-700 text-gray-300'}`}>
                              <span style={{color: cfg.color}} className="flex-shrink-0">{cfg.emoji}</span>
                              <span>{role}</span>
                            </button>
                          );
                        })
                      ) : (
                        Object.entries(CATEGORY_DISPLAY).filter(([key]) => key !== 'Sonstige' || allRoles.some(r => getRoleCategory(r) === 'Sonstige')).map(([key, cfg]) => (
                          <button key={key} onClick={() => setRrSelected(key)}
                            className={`w-full text-left px-3 py-2.5 text-sm transition-colors flex items-center gap-2 border-b border-gray-700 last:border-0 ${rrSelected === key ? 'bg-orange-700 bg-opacity-40 text-orange-200 font-semibold' : 'hover:bg-gray-700 text-gray-300'}`}>
                            <span style={{color: cfg.color}} className="flex-shrink-0">{cfg.emoji}</span>
                            <span>{cfg.label}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  {!rrSelected ? (
                    <div className="flex items-center justify-center h-64 bg-gray-800 rounded-xl border border-gray-700 border-dashed">
                      <div className="text-center text-gray-500">
                        <Award size={40} className="mx-auto mb-3 opacity-40" />
                        <p className="text-lg font-semibold">Wähle {rrMode === 'role' ? 'eine Rolle' : 'eine Kategorie'}</p>
                        <p className="text-sm mt-1">aus der Liste links</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {(() => {
                        const cfg = rrMode === 'category'
                          ? (CATEGORY_DISPLAY[rrSelected] || CATEGORY_DISPLAY.Sonstige)
                          : (CATEGORY_DISPLAY[getRoleCategory(rrSelected)] || CATEGORY_DISPLAY.Sonstige);
                        return (
                          <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 mb-5" style={{borderLeftColor: cfg.color, borderLeftWidth: 4}}>
                            <div className="flex items-center gap-3 mb-3">
                              <span className="text-4xl">{cfg.emoji}</span>
                              <div>
                                <h2 className="text-2xl font-bold text-white">{rrMode === 'role' ? rrSelected : cfg.label}</h2>
                                {rrMode === 'role' && <p className="text-sm mt-0.5" style={{color: cfg.color}}>{cfg.label}</p>}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm">
                              <div className="bg-gray-700 rounded-lg px-3 py-2">
                                <div className="text-xs text-gray-400 mb-0.5">Qualifizierte Spieler</div>
                                <div className="font-bold text-white">{rows.length}</div>
                              </div>
                              <div className="bg-gray-700 rounded-lg px-3 py-2">
                                <div className="text-xs text-gray-400 mb-0.5">Spiele gesamt</div>
                                <div className="font-bold text-white">{rows.reduce((s,r) => s+r.games, 0)}</div>
                              </div>
                              {rows.length > 0 && (
                                <>
                                  <div className="bg-gray-700 rounded-lg px-3 py-2">
                                    <div className="text-xs text-gray-400 mb-0.5">Beste Winrate</div>
                                    <div className="font-bold text-green-400">{rows[0].name}: {rows[0].winrate}%</div>
                                  </div>
                                  <div className="bg-gray-700 rounded-lg px-3 py-2">
                                    <div className="text-xs text-gray-400 mb-0.5">Meist gespielt</div>
                                    <div className="font-bold text-blue-400">{[...rows].sort((a,b)=>b.games-a.games)[0].name}: {[...rows].sort((a,b)=>b.games-a.games)[0].games}×</div>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {rows.length >= 1 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
                          {rows.slice(0,3).map((p, i) => (
                            <div key={p.name} onClick={() => handlePlayerClick(p.name)}
                              className={`bg-gray-800 rounded-xl p-4 cursor-pointer hover:scale-105 transition-all border ${i===0?'border-yellow-600 bg-yellow-950 bg-opacity-20':i===1?'border-gray-500':'border-amber-700 bg-amber-950 bg-opacity-10'}`}>
                              <div className="flex items-start justify-between mb-2">
                                <span className="text-2xl">{medals[i]}</span>
                                <span className={`text-2xl font-black ${p.winrate > 50 ? 'text-green-400' : p.winrate === 50 ? 'text-yellow-400' : 'text-red-400'}`}>{p.winrate}%</span>
                              </div>
                              <div className="font-bold text-white mb-1">👤 {p.name}</div>
                              <div className="text-xs text-gray-400">{p.wins}S / {p.losses}N • {p.games} Spiele</div>
                              {rrMode === 'category' && p.roles && (
                                <div className="text-xs text-gray-500 mt-1 truncate" title={p.roles}>{p.roles}</div>
                              )}
                              <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
                                <div className="h-1.5 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500" style={{width:`${p.winrate}%`}}/>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {rows.length > 0 && (
                        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-gray-900 border-b border-gray-700">
                                <th className="text-center py-3 px-3 text-gray-400 w-10">#</th>
                                <th className="text-left py-3 px-4 text-gray-400">Spieler</th>
                                {rrMode === 'category' && <th className="text-left py-3 px-4 text-gray-400">Rollen</th>}
                                <th className="text-center py-3 px-4">
                                  <button className="flex items-center mx-auto hover:text-white text-gray-400" onClick={() => handleRrSort('games')}>Spiele<RrSortIcon k="games"/></button>
                                </th>
                                <th className="text-center py-3 px-4 text-green-400">
                                  <button className="flex items-center mx-auto hover:text-white" onClick={() => handleRrSort('wins')}>Siege<RrSortIcon k="wins"/></button>
                                </th>
                                <th className="text-center py-3 px-4 text-red-400">Niedr.</th>
                                <th className="text-center py-3 px-4">
                                  <button className="flex items-center mx-auto hover:text-white text-orange-400 font-semibold" onClick={() => handleRrSort('winrate')}>
                                    <Award size={13} className="mr-1"/>Winrate<RrSortIcon k="winrate"/>
                                  </button>
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {rows.map((p, idx) => (
                                <tr key={p.name} onClick={() => handlePlayerClick(p.name)}
                                  className={`border-b border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors ${idx < 3 ? 'bg-gray-800' : idx % 2 === 0 ? 'bg-gray-800' : ''}`}>
                                  <td className="py-3 px-3 text-center">
                                    {idx < 3
                                      ? <span className="text-lg">{medals[idx]}</span>
                                      : <span className="text-gray-500 font-mono text-sm">#{idx+1}</span>}
                                  </td>
                                  <td className="py-3 px-4 font-semibold text-white">👤 {p.name}</td>
                                  {rrMode === 'category' && (
                                    <td className="py-3 px-4 text-xs text-gray-400 max-w-[180px] truncate" title={p.roles}>{p.roles}</td>
                                  )}
                                  <td className="py-3 px-4 text-center font-mono">{p.games}</td>
                                  <td className="py-3 px-4 text-center font-mono text-green-400">{p.wins}</td>
                                  <td className="py-3 px-4 text-center font-mono text-red-400">{p.losses}</td>
                                  <td className="py-3 px-4 text-center">
                                    <div className="flex flex-col items-center gap-1">
                                      <span className={`font-bold ${p.winrate > 50 ? 'text-green-400' : p.winrate === 50 ? 'text-yellow-400' : 'text-red-400'}`}>{p.winrate}%</span>
                                      <div className="w-14 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${p.winrate > 50 ? 'bg-green-500' : p.winrate === 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                          style={{width:`${p.winrate}%`}}/>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {rows.length === 0 && (
                        <div className="flex items-center justify-center h-40 bg-gray-800 rounded-xl border border-gray-700 border-dashed">
                          <p className="text-gray-500">Keine Spieler mit {rrMinGames}+ Spielen gefunden.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ======================== HALL OF FAME PAGE ======================== */}
        {activePage === 'hof' && (() => {
          const hofData = getHallOfFameData();
          const hofCatData = getHallOfFameCategoryData();
          const years = getAvailableYears();
          const medals = ['🥇', '🥈', '🥉'];
          const medalBg = [
            'bg-yellow-900 bg-opacity-30 border-yellow-600',
            'bg-gray-700 border-gray-500',
            'bg-amber-900 bg-opacity-30 border-amber-700',
          ];

          const PodiumCard = ({ player, i, extra }) => (
            <div
              onClick={() => handlePlayerClick(player.name)}
              className={`flex-1 rounded-xl border p-5 cursor-pointer hover:scale-105 transition-transform ${medalBg[i]}`}
              style={{ flexGrow: i === 0 ? 1.4 : 1 }}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{medals[i]}</span>
                <div className="text-right">
                  <div className={`text-3xl font-black ${player.winrate > 50 ? 'text-green-400' : player.winrate === 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {player.winrate}%
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">Winrate</div>
                </div>
              </div>
              <div className={`font-bold text-lg mb-1 ${i === 0 ? 'text-yellow-200' : 'text-white'}`}>👤 {player.name}</div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-green-400 font-semibold">{player.wins}S</span>
                <span className="text-xs text-gray-500">/</span>
                <span className="text-xs text-red-400 font-semibold">{player.total - player.wins}N</span>
                <span className="text-xs text-gray-500 ml-1">({player.total} Sp.)</span>
              </div>
              {extra && <div className="text-xs text-gray-500 mt-1">{extra}</div>}
              <div className="w-full bg-gray-700 rounded-full h-1.5 mt-3">
                <div className="h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: `${player.winrate}%` }} />
              </div>
            </div>
          );

          return (
            <div>
              <div className="bg-gray-800 rounded-lg p-5 mb-8 border border-gray-700 space-y-4">
                <div className="flex flex-wrap gap-6 items-end">
                  <div>
                    <label className="block text-xs text-gray-400 mb-2 font-medium">Ansicht</label>
                    <div className="flex gap-1">
                      <button onClick={() => setHofView('scripts')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${hofView === 'scripts' ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                        <Scroll size={14} /> Scripts
                      </button>
                      <button onClick={() => setHofView('categories')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${hofView === 'categories' ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                        <Shield size={14} /> Rollen-Kategorien
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-2 font-medium flex items-center gap-1"><Calendar size={12}/>Saison</label>
                    <div className="flex gap-2">
                      {['all', ...years].map(y => (
                        <button key={y} onClick={() => setHofSeason(y)}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${hofSeason === y ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                          {y === 'all' ? 'All Time' : `Season ${y}`}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-2 font-medium">Min. Spiele (Qualifikation)</label>
                    <div className="flex gap-2">
                      {[5, 10, 15, 20].map(n => (
                        <button key={n} onClick={() => setHofMinGames(n)}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${hofMinGames === n ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                          {n}+
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {hofView === 'scripts' && hofData.map(({ script, label, top3 }) => (
                <div key={script} className={`mb-8 rounded-xl border ${script === '__all__' ? 'border-yellow-600 bg-gradient-to-br from-yellow-950 via-gray-900 to-gray-900' : 'border-gray-700 bg-gray-800'} overflow-hidden`}>
                  <div className={`px-6 py-4 flex items-center gap-3 ${script === '__all__' ? 'border-b border-yellow-700' : 'border-b border-gray-700'}`}>
                    {script === '__all__' ? <Crown size={22} className="text-yellow-400" /> : <Scroll size={20} className="text-purple-400" />}
                    <h2 className={`text-xl font-bold ${script === '__all__' ? 'text-yellow-400' : 'text-white'}`}>{label}</h2>
                    {top3.length === 0 && <span className="ml-auto text-sm text-gray-500">Noch keine {hofMinGames}+ Qualifizierer</span>}
                  </div>
                  {top3.length > 0 && (
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        {top3.map((player, i) => <PodiumCard key={player.name} player={player} i={i} />)}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {hofView === 'categories' && (
                <div>
                  {hofCatData.filter(({ catKey, top3 }) => catKey !== 'Sonstige' || top3.length > 0).map(({ catKey, label, emoji, color, top3 }) => (
                    <div key={catKey} className="mb-8 rounded-xl border border-gray-700 bg-gray-800 overflow-hidden">
                      <div className="px-6 py-4 flex items-center gap-3 border-b border-gray-700" style={{borderLeftColor: color, borderLeftWidth: 4}}>
                        <span className="text-2xl">{emoji}</span>
                        <h2 className="text-xl font-bold text-white">{label}</h2>
                        {top3.length === 0 && <span className="ml-auto text-sm text-gray-500">Noch keine {hofMinGames}+ Qualifizierer</span>}
                      </div>
                      {top3.length > 0 && (
                        <div className="p-6">
                          <div className="flex flex-col md:flex-row gap-4">
                            {top3.map((player, i) => <PodiumCard key={player.name} player={player} i={i} />)}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* ======================== PLAYER DETAIL PAGE ======================== */}
        {activePage === 'player' && (
          <div>
            <div className="mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input type="text" placeholder="Spielername suchen..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <div className="mt-3 flex gap-2 flex-wrap">
                {(searchQuery ? filteredPlayers : availablePlayers).slice(0, 10).map(player => (
                  <button key={player.id} onClick={() => handlePlayerClick(player.name)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${selectedPlayer?.name === player.name ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-800 hover:bg-gray-700'}`}>
                    {player.avatar} {player.name}
                  </button>
                ))}
                {searchQuery && filteredPlayers.length > 10 && <span className="px-3 py-1.5 text-sm text-gray-400">+{filteredPlayers.length - 10} weitere...</span>}
              </div>
            </div>

            {selectedPlayer && playerStats && (
              <div>
                <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
                  <div className="flex items-center gap-3 mb-3"><Calendar size={20} className="text-purple-400" /><h3 className="font-semibold">Jahr</h3></div>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setSelectedSeason('all')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedSeason === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>Alle Jahre</button>
                    {getAvailableYears().map(year => (
                      <button key={year} onClick={() => setSelectedSeason(year)} className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedSeason === year ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>Season {year}</button>
                    ))}
                  </div>
                </div>
                {getAvailableScripts().length > 1 && (
                  <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
                    <div className="flex items-center gap-3 mb-3"><Scroll size={20} className="text-purple-400" /><h3 className="font-semibold">Script Filter</h3></div>
                    <div className="flex gap-2 flex-wrap">
                      <button onClick={() => setSelectedScript('all')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedScript === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>Alle Scripts</button>
                      {getAvailableScripts().map(script => (
                        <button key={script} onClick={() => setSelectedScript(script)} className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedScript === script ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>{script}</button>
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
                  {[
                    { icon: <Award className="text-yellow-400" size={24} />, title: 'Gesamt Winrate', val: `${playerStats.winrate}%`, sub: `${playerStats.wins}S / ${playerStats.total - playerStats.wins}N`, color: 'yellow' },
                    { icon: <Skull className="text-red-400" size={24} />, title: 'Böse Winrate', val: `${playerStats.evilWinrate}%`, sub: `${playerStats.evilWins}S / ${playerStats.evilGames - playerStats.evilWins}N`, color: 'red' },
                    { icon: <Heart className="text-blue-400" size={24} />, title: 'Gut Winrate', val: `${playerStats.goodWinrate}%`, sub: `${playerStats.goodWins}S / ${playerStats.goodGames - playerStats.goodWins}N`, color: 'blue' },
                    { icon: <BookOpen className="text-purple-400" size={24} />, title: 'Storyteller', val: playerStats.storytellerGames, sub: 'Spiele geleitet', color: 'purple' },
                  ].map((card, i) => (
                    <div key={i} className={`bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-${card.color}-500 transition-colors`}>
                      <div className="flex items-center gap-3 mb-2">{card.icon}<h3 className="text-lg font-semibold">{card.title}</h3></div>
                      <p className={`text-3xl font-bold text-${card.color}-400`}>{card.val}</p>
                      <p className="text-gray-400 text-sm">{card.sub}</p>
                    </div>
                  ))}
                </div>

                {playerStats.radarData && playerStats.radarData.length >= 2 && (
                  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
                    <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
                      <span className="text-purple-400">🕸️</span> Rollen-Kategorien
                    </h3>
                    <p className="text-gray-400 text-sm mb-6">Winrate pro Rollen-Kategorie — je weiter außen, desto besser</p>
                    <div className="flex flex-col lg:flex-row gap-6 items-center">
                      <div className="w-full lg:w-1/2" style={{height: 320}}>
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={playerStats.radarData} margin={{top: 10, right: 30, bottom: 10, left: 30}}>
                            <PolarGrid stroke="#374151" />
                            <PolarAngleAxis
                              dataKey="category"
                              tick={({ x, y, payload, cx, cy }) => {
                                const cat = playerStats.radarData.find(d => d.category === payload.value);
                                return (
                                  <text x={x} y={y} textAnchor={x > cx + 5 ? "start" : x < cx - 5 ? "end" : "middle"} dominantBaseline="central" fill={cat ? cat.color : "#9ca3af"} fontSize={12} fontWeight={600}>
                                    {cat ? cat.emoji + " " + payload.value : payload.value}
                                  </text>
                                );
                              }}
                            />
                            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar
                              dataKey="winrate"
                              stroke="#a855f7"
                              fill="#a855f7"
                              fillOpacity={0.25}
                              strokeWidth={2}
                            />
                            <Tooltip
                              contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: 8 }}
                              formatter={(val, _name, props) => {
                                const d = props.payload;
                                return [`${val}%  (${d.wins}S / ${d.games - d.wins}N, ${d.games} Sp.)`, d.emoji + " " + d.category];
                              }}
                              labelFormatter={() => ""}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="w-full lg:w-1/2 grid grid-cols-2 gap-3">
                        {playerStats.radarData.map((d, i) => (
                          <div key={i}
                            onClick={() => setSelectedCategory(selectedCategory === d.category ? null : d.category)}
                            className={`rounded-lg p-3 flex flex-col gap-1 cursor-pointer transition-all ${selectedCategory === d.category ? "ring-2 ring-white bg-gray-600" : "bg-gray-700 hover:bg-gray-600"}`}
                            style={{borderLeft: `3px solid ${d.color}`}}>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-white">{d.emoji} {d.category}</span>
                              <div className="flex items-center gap-2">
                                {selectedCategory === d.category && <span className="text-xs bg-white text-gray-900 px-1.5 py-0.5 rounded font-bold">Aktiv</span>}
                                <span className="text-lg font-bold" style={{color: d.winrate > 50 ? "#4ade80" : "#f87171"}}>{d.winrate}%</span>
                              </div>
                            </div>
                            <div className="text-xs text-gray-400">{d.wins}S / {d.games - d.wins}N • {d.games} Spiele</div>
                            <div className="w-full bg-gray-600 rounded-full h-1.5 mt-1">
                              <div className="h-1.5 rounded-full" style={{width: `${d.winrate}%`, backgroundColor: d.color, opacity: 0.8}} />
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">Klicken zum Filtern ↓</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {playerStats.roleStats.length > 0 && (
                  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Users size={24} className="text-purple-400" />Rollen-Statistiken</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead><tr className="border-b border-gray-700">
                          <th className="text-left py-2 px-2">Rolle</th><th className="text-center py-2 px-2">Spiele</th><th className="text-center py-2 px-2">Siege</th><th className="text-center py-2 px-2">Winrate</th>
                        </tr></thead>
                        <tbody>
                          {playerStats.roleStats.map((stat, idx) => (
                            <tr key={idx} className="border-b border-gray-700 hover:bg-gray-750">
                              <td className="py-3 px-2 font-medium">{stat.role}</td>
                              <td className="text-center py-3 px-2">{stat.games}</td>
                              <td className="text-center py-3 px-2">{stat.wins}</td>
                              <td className="text-center py-3 px-2"><span className={`font-bold ${parseFloat(stat.winrate) > 50 ? 'text-green-400' : 'text-red-400'}`}>{stat.winrate}%</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {playerStats.teammateStats.length > 0 && (
                  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><UserCheck size={24} className="text-purple-400" />Mitspieler-Statistiken</h3>
                    <p className="text-gray-400 text-sm mb-4">{playerStats.teammateStats.length} Spieler • Klicke auf einen Spieler um die Match History zu filtern</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {playerStats.teammateStats.map((teammate, idx) => (
                        <div key={idx}
                          className={`p-4 rounded-lg cursor-pointer transition-all ${selectedTeammate === teammate.name ? 'bg-purple-700 border-2 border-purple-400' : 'bg-gray-700 hover:bg-gray-600 border-2 border-transparent'}`}
                          onClick={() => setSelectedTeammate(selectedTeammate === teammate.name ? null : teammate.name)}>
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-semibold text-lg">{teammate.name}</span>
                            <span className="text-xs text-gray-400">{teammate.total} Spiele gesamt</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className={`rounded-lg p-2.5 ${teammate.sameTeam > 0 ? 'bg-blue-900 bg-opacity-40' : 'bg-gray-800 bg-opacity-50'}`}>
                              <div className="text-xs text-blue-300 font-medium mb-1">🤝 Selbes Team</div>
                              {teammate.sameTeam > 0 ? (
                                <>
                                  <div className={`text-xl font-bold ${parseFloat(teammate.winrate) > 50 ? 'text-green-400' : 'text-red-400'}`}>{teammate.winrate}%</div>
                                  <div className="text-xs text-gray-400 mt-0.5">{teammate.sameTeamWins}S / {teammate.sameTeam - teammate.sameTeamWins}N ({teammate.sameTeam} Sp.)</div>
                                </>
                              ) : (
                                <div className="text-xs text-gray-500 mt-1">Keine Spiele</div>
                              )}
                            </div>
                            <div className={`rounded-lg p-2.5 ${teammate.oppTeam > 0 ? 'bg-red-900 bg-opacity-40' : 'bg-gray-800 bg-opacity-50'}`}>
                              <div className="text-xs text-red-300 font-medium mb-1">⚔️ Gegner</div>
                              {teammate.oppTeam > 0 ? (
                                <>
                                  <div className={`text-xl font-bold ${parseFloat(teammate.oppWinrate) > 50 ? 'text-green-400' : 'text-red-400'}`}>{teammate.oppWinrate}%</div>
                                  <div className="text-xs text-gray-400 mt-0.5">{teammate.oppTeamWins}S / {teammate.oppTeam - teammate.oppTeamWins}N ({teammate.oppTeam} Sp.)</div>
                                </>
                              ) : (
                                <div className="text-xs text-gray-500 mt-1">Keine Spiele</div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <TrendingUp size={24} className="text-purple-400" />Match History
                    {selectedTeammate && <span className="text-sm font-normal text-purple-300 ml-2">(gefiltert: mit {selectedTeammate} im selben Team)</span>}
                    {selectedCategory && <span className="text-sm font-normal text-purple-300 ml-2">(gefiltert: Kategorie {selectedCategory})</span>}
                  </h3>
                  <div className="space-y-3">
                    {matches.filter(match => {
                      const seasonMatch = selectedSeason === 'all' || getMatchSeason(match.date) === selectedSeason;
                      const scriptMatch = selectedScript === 'all' || match.script === selectedScript;
                      const categoryMatch = !selectedCategory || getRoleCategory(match.role) === Object.keys(CATEGORY_DISPLAY).find(k => CATEGORY_DISPLAY[k].label === selectedCategory);
                      let teammateMatch = true;
                      if (selectedTeammate) {
                        if (match.role === 'Storyteller') {
                          teammateMatch = false;
                        } else {
                          const fullMatch = getAllMatches().find(m => m.id === match.id);
                          if (fullMatch) {
                            const cpd = fullMatch.players.find(p => p.name === selectedPlayer.name);
                            const td = fullMatch.players.find(p => p.name === selectedTeammate);
                            teammateMatch = !!(td && cpd && td.team === cpd.team);
                          } else {
                            teammateMatch = false;
                          }
                        }
                      }
                      return seasonMatch && scriptMatch && teammateMatch && categoryMatch;
                    }).map((match) => {
                      const fullMatch = getAllMatches().find(m => m.id === match.id);
                      const isExpanded = expandedMatch === match.id;

                      // For Storyteller entries we keep a simple row
                      if (match.role === 'Storyteller') {
                        return (
                          <div key={match.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                            <div
                              className="px-5 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-700 transition-colors"
                              onClick={() => setExpandedMatch(isExpanded ? null : match.id)}>
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-gray-400 text-sm">Spiel #{match.id}</span>
                                <BookOpen size={16} className="text-purple-400" />
                                <span className="font-semibold text-purple-300">Storyteller</span>
                                <span className="text-white font-semibold">{match.script}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-400">{match.date}</span>
                                {isExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                              </div>
                            </div>
                            {isExpanded && fullMatch && (() => {
                              const goodPlayers = fullMatch.players.filter(p => p.team === 'Gut');
                              const evilPlayers = fullMatch.players.filter(p => p.team === 'Böse');
                              const goodWon = fullMatch.players.find(p => p.team === 'Gut')?.result === 'Sieg';
                              return (
                                <div>
                                  <div className={`px-5 py-2 flex items-center gap-3 border-t border-gray-700 ${goodWon ? 'bg-blue-900 bg-opacity-10' : 'bg-red-900 bg-opacity-10'}`}>
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${goodWon ? 'bg-blue-600 bg-opacity-60 text-blue-200' : 'bg-red-600 bg-opacity-60 text-red-200'}`}>
                                      {goodWon ? '💙 Gut gewinnt' : '❤️ Böse gewinnt'}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-700">
                                    <div className="p-4">
                                      <div className="text-xs text-blue-400 font-semibold uppercase tracking-wide mb-3 flex items-center gap-1"><Heart size={12} /> Gut ({goodPlayers.length})</div>
                                      <div className="space-y-1.5">
                                        {goodPlayers.map((p, i) => {
                                          const cfg = CATEGORY_DISPLAY[getRoleCategory(p.role)] || CATEGORY_DISPLAY.Sonstige;
                                          return (
                                            <div key={i} onClick={() => handlePlayerClick(p.name)} className="flex items-center justify-between cursor-pointer hover:bg-gray-700 rounded px-2 py-1 transition-colors">
                                              <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-white hover:text-blue-300">{p.name}</span>
                                                <span className="text-xs px-2 py-0.5 rounded-full" style={{backgroundColor: cfg.color+'22', color: cfg.color}}>{cfg.emoji} {p.role}</span>
                                              </div>
                                              <span className={`text-xs font-semibold ${p.result === 'Sieg' ? 'text-green-400' : 'text-red-400'}`}>{p.result === 'Sieg' ? '✓' : '✗'}</span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                    <div className="p-4">
                                      <div className="text-xs text-red-400 font-semibold uppercase tracking-wide mb-3 flex items-center gap-1"><Skull size={12} /> Böse ({evilPlayers.length})</div>
                                      <div className="space-y-1.5">
                                        {evilPlayers.map((p, i) => {
                                          const cfg = CATEGORY_DISPLAY[getRoleCategory(p.role)] || CATEGORY_DISPLAY.Sonstige;
                                          return (
                                            <div key={i} onClick={() => handlePlayerClick(p.name)} className="flex items-center justify-between cursor-pointer hover:bg-gray-700 rounded px-2 py-1 transition-colors">
                                              <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-white hover:text-red-300">{p.name}</span>
                                                <span className="text-xs px-2 py-0.5 rounded-full" style={{backgroundColor: cfg.color+'22', color: cfg.color}}>{cfg.emoji} {p.role}</span>
                                              </div>
                                              <span className={`text-xs font-semibold ${p.result === 'Sieg' ? 'text-green-400' : 'text-red-400'}`}>{p.result === 'Sieg' ? '✓' : '✗'}</span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        );
                      }

                      // Regular played match
                      const goodWon = fullMatch?.players.find(p => p.team === 'Gut')?.result === 'Sieg';
                      const goodPlayers = fullMatch?.players.filter(p => p.team === 'Gut') ?? [];
                      const evilPlayers = fullMatch?.players.filter(p => p.team === 'Böse') ?? [];
                      const myResult = match.result === 'Sieg';
                      const myCfg = CATEGORY_DISPLAY[getRoleCategory(match.role)] || CATEGORY_DISPLAY.Sonstige;

                      return (
                        <div key={match.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                          {/* Header row — always visible */}
                          <div
                            className={`px-5 py-3 flex items-center justify-between cursor-pointer transition-colors ${isExpanded ? '' : 'hover:bg-gray-750'} ${myResult ? 'bg-green-900 bg-opacity-10' : 'bg-red-900 bg-opacity-10'}`}
                            onClick={() => setExpandedMatch(isExpanded ? null : match.id)}>
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="font-bold text-gray-400 text-sm">Spiel #{match.id}</span>
                              {/* My role badge */}
                              <span className="text-xs px-2 py-0.5 rounded-full font-semibold ring-1"
                                style={{
                                  backgroundColor: myCfg.color + '22',
                                  color: myCfg.color,
                                  ringColor: myResult ? '#4ade80' : '#f87171',
                                  outline: `1px solid ${myResult ? '#4ade80' : '#f87171'}`
                                }}>
                                {myCfg.emoji} {match.role}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${match.team === 'Böse' ? 'bg-red-600 bg-opacity-40 text-red-300' : 'bg-blue-600 bg-opacity-40 text-blue-300'}`}>
                                {match.team === 'Böse' ? '❤️ Böse' : '💙 Gut'}
                              </span>
                              <span className={`font-bold text-sm ${myResult ? 'text-green-400' : 'text-red-400'}`}>
                                {myResult ? '✓ Sieg' : '✗ Niederlage'}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className="text-sm text-white font-medium">{match.script}</div>
                                <div className="text-xs text-gray-500">{match.date}</div>
                              </div>
                              {isExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                            </div>
                          </div>

                          {/* Expanded: session-style team split */}
                          {isExpanded && fullMatch && (
                            <div>
                              <div className={`px-5 py-2 flex items-center justify-between border-t border-gray-700 ${goodWon ? 'bg-blue-900 bg-opacity-10' : 'bg-red-900 bg-opacity-10'}`}>
                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${goodWon ? 'bg-blue-600 bg-opacity-60 text-blue-200' : 'bg-red-600 bg-opacity-60 text-red-200'}`}>
                                  {goodWon ? '💙 Gut gewinnt' : '❤️ Böse gewinnt'}
                                </span>
                                {fullMatch.storyteller && fullMatch.storyteller !== 'Unknown' && (
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <BookOpen size={12} /> {fullMatch.storyteller}
                                  </span>
                                )}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-700">
                                {/* Good */}
                                <div className="p-4">
                                  <div className="text-xs text-blue-400 font-semibold uppercase tracking-wide mb-3 flex items-center gap-1">
                                    <Heart size={12} /> Gut ({goodPlayers.length})
                                  </div>
                                  <div className="space-y-1.5">
                                    {goodPlayers.map((p, i) => {
                                      const cfg = CATEGORY_DISPLAY[getRoleCategory(p.role)] || CATEGORY_DISPLAY.Sonstige;
                                      const isMe = p.name === selectedPlayer.name;
                                      return (
                                        <div key={i} onClick={() => handlePlayerClick(p.name)}
                                          className={`flex items-center justify-between cursor-pointer rounded px-2 py-1.5 transition-colors ${isMe ? 'bg-purple-900 bg-opacity-40 ring-1 ring-purple-500' : 'hover:bg-gray-700'}`}>
                                          <div className="flex items-center gap-2">
                                            <span className={`text-sm font-medium hover:text-blue-300 ${isMe ? 'text-purple-300' : 'text-white'}`}>
                                              {isMe ? '★ ' : ''}{p.name}
                                            </span>
                                            <span className="text-xs px-2 py-0.5 rounded-full" style={{backgroundColor: cfg.color+'22', color: cfg.color}}>
                                              {cfg.emoji} {p.role}
                                            </span>
                                          </div>
                                          <span className={`text-xs font-semibold ${p.result === 'Sieg' ? 'text-green-400' : 'text-red-400'}`}>
                                            {p.result === 'Sieg' ? '✓' : '✗'}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                                {/* Evil */}
                                <div className="p-4">
                                  <div className="text-xs text-red-400 font-semibold uppercase tracking-wide mb-3 flex items-center gap-1">
                                    <Skull size={12} /> Böse ({evilPlayers.length})
                                  </div>
                                  <div className="space-y-1.5">
                                    {evilPlayers.map((p, i) => {
                                      const cfg = CATEGORY_DISPLAY[getRoleCategory(p.role)] || CATEGORY_DISPLAY.Sonstige;
                                      const isMe = p.name === selectedPlayer.name;
                                      return (
                                        <div key={i} onClick={() => handlePlayerClick(p.name)}
                                          className={`flex items-center justify-between cursor-pointer rounded px-2 py-1.5 transition-colors ${isMe ? 'bg-purple-900 bg-opacity-40 ring-1 ring-purple-500' : 'hover:bg-gray-700'}`}>
                                          <div className="flex items-center gap-2">
                                            <span className={`text-sm font-medium hover:text-red-300 ${isMe ? 'text-purple-300' : 'text-white'}`}>
                                              {isMe ? '★ ' : ''}{p.name}
                                            </span>
                                            <span className="text-xs px-2 py-0.5 rounded-full" style={{backgroundColor: cfg.color+'22', color: cfg.color}}>
                                              {cfg.emoji} {p.role}
                                            </span>
                                          </div>
                                          <span className={`text-xs font-semibold ${p.result === 'Sieg' ? 'text-green-400' : 'text-red-400'}`}>
                                            {p.result === 'Sieg' ? '✓' : '✗'}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
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
        )}

        {/* ======================== LAST SESSION PAGE ======================== */}
        {activePage === 'session' && (() => {
          const { date, matches: sessionMatches, playerStats: sessionPlayers, allDates } = getLastSessionData(selectedSession);

          if (!date) {
            return (
              <div className="flex items-center justify-center h-64 bg-gray-800 rounded-xl border border-gray-700 border-dashed">
                <div className="text-center text-gray-500">
                  <Calendar size={40} className="mx-auto mb-3 opacity-40" />
                  <p className="text-lg font-semibold">Keine Spiele gefunden</p>
                  <p className="text-sm mt-1">Importiere zuerst deine Spiele</p>
                </div>
              </div>
            );
          }

          const [y, mo, d] = date.split('-');
          const formattedDate = `${d}.${mo}.${y}`;
          const isLatest = date === allDates[0];
          const currentIdx = allDates.indexOf(date);

          const totalGames = sessionMatches.length;
          const uniquePlayers = sessionPlayers.length;
          const scripts = [...new Set(sessionMatches.map(m => m.script))];

          const mvp = [...sessionPlayers].filter(p => p.games >= 2).sort((a,b) => b.winrate - a.winrate || b.wins - a.wins)[0]
                   || [...sessionPlayers].sort((a,b) => b.winrate - a.winrate || b.wins - a.wins)[0];
          const pechvogel = [...sessionPlayers].filter(p => p.games >= 2).sort((a,b) => a.winrate - b.winrate || a.wins - b.wins)[0]
                         || [...sessionPlayers].sort((a,b) => a.winrate - b.winrate)[0];

          const medals = ['🥇','🥈','🥉'];

          const fmtDate = (isoDate) => {
            const [yy, mm, dd] = isoDate.split('-');
            return `${dd}.${mm}.${yy}`;
          };

          return (
            <div>
              {/* Session Header */}
              <div className="bg-gradient-to-r from-cyan-900 to-blue-900 rounded-xl border border-cyan-700 p-6 mb-6 shadow-xl">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <Calendar size={28} className="text-cyan-400 flex-shrink-0" />
                      <h2 className="text-3xl font-bold text-white">
                        {isLatest ? 'Letzte Session' : 'Session'}
                      </h2>
                      {isLatest && <span className="text-xs bg-cyan-600 text-cyan-100 px-2 py-0.5 rounded-full font-semibold">Aktuell</span>}
                    </div>

                    {/* Session Dropdown */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        value={date}
                        onChange={e => setSelectedSession(e.target.value)}
                        className="bg-gray-900 border border-cyan-700 text-white rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:border-cyan-400 cursor-pointer"
                      >
                        {allDates.map((d2, i) => (
                          <option key={d2} value={d2}>
                            {fmtDate(d2)}{i === 0 ? ' (Letzte)' : ''}
                          </option>
                        ))}
                      </select>
                      {/* Prev / Next arrows */}
                      <button
                        onClick={() => setSelectedSession(allDates[currentIdx + 1])}
                        disabled={currentIdx >= allDates.length - 1}
                        className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-sm text-gray-300 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Ältere Session"
                      >‹ Älter</button>
                      <button
                        onClick={() => setSelectedSession(currentIdx === 1 ? null : allDates[currentIdx - 1])}
                        disabled={currentIdx === 0}
                        className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-sm text-gray-300 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Neuere Session"
                      >Neuer ›</button>
                    </div>

                    <p className="text-gray-400 text-sm mt-2">{scripts.join(' • ')}</p>
                  </div>
                  <div className="flex gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-black text-cyan-400">{totalGames}</div>
                      <div className="text-xs text-gray-400 mt-0.5">Spiele</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-black text-purple-400">{uniquePlayers}</div>
                      <div className="text-xs text-gray-400 mt-0.5">Spieler</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-black text-yellow-400">{scripts.length}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{scripts.length === 1 ? 'Script' : 'Scripts'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Session Highlights (collapsible) */}
              {(() => {
                const hl = getSessionHighlightsData(sessionHighlightYear);
                if (!hl) return null;

                // collect available years from all session dates
                const allSessionDates = getSessionDates();
                const availableYears = [...new Set(allSessionDates.map(d => getMatchSeason(d)))].sort((a,b) => Number(a)-Number(b));

                const cards = [
                  { icon: '📅', accent: 'border-cyan-500',    label: 'Meiste Sessions gespielt',
                    content: hl.mostSessions ? <><span className="font-bold text-white">{hl.mostSessions.name}</span><span className="text-gray-300"> — </span><span className="font-bold text-cyan-300">{hl.mostSessions.sessions} Sessions</span><span className="text-xs text-gray-500 ml-1">von {hl.totalSessions} gesamt</span></> : null },
                  { icon: '🏆', accent: 'border-yellow-500',  label: 'Meiste Sessions gewonnen (≥50% WR)',
                    content: hl.mostSessionsWon ? <><span className="font-bold text-white">{hl.mostSessionsWon.name}</span><span className="text-gray-300"> gewann </span><span className="font-bold text-yellow-300">{hl.mostSessionsWon.sessionsWon} Sessions</span><span className="text-xs text-gray-500 ml-1">({hl.mostSessionsWon.sessions} gespielt)</span></> : null },
                  { icon: '💀', accent: 'border-red-500',     label: 'Meiste Sessions verloren (0% WR)',
                    content: hl.mostSessionsLost ? <><span className="font-bold text-white">{hl.mostSessionsLost.name}</span><span className="text-gray-300"> verlor </span><span className="font-bold text-red-400">{hl.mostSessionsLost.sessionsLost} Sessions</span><span className="text-xs text-gray-500 ml-1">komplett</span></> : null },
                  { icon: '⭐', accent: 'border-green-500',   label: 'Beste Session-Winrate (3+ Sessions)',
                    content: hl.bestSessionWr ? <><span className="font-bold text-white">{hl.bestSessionWr.name}</span><span className="font-bold text-green-400 ml-1">{hl.bestSessionWr.sessionWinrate}%</span><span className="text-gray-300"> der Sessions gewonnen </span><span className="text-xs text-gray-500">({hl.bestSessionWr.sessionsWon}/{hl.bestSessionWr.sessions})</span></> : null },
                  { icon: '😰', accent: 'border-rose-500',    label: 'Schlechteste Session-Winrate (3+ Sessions)',
                    content: hl.worstSessionWr ? <><span className="font-bold text-white">{hl.worstSessionWr.name}</span><span className="font-bold text-red-400 ml-1">{hl.worstSessionWr.sessionWinrate}%</span><span className="text-gray-300"> der Sessions gewonnen </span><span className="text-xs text-gray-500">({hl.worstSessionWr.sessionsWon}/{hl.worstSessionWr.sessions})</span></> : null },
                  { icon: '🌟', accent: 'border-amber-500',   label: 'Meiste perfekte Sessions (100% WR)',
                    content: hl.mostPerfect ? <><span className="font-bold text-white">{hl.mostPerfect.name}</span><span className="text-gray-300"> hatte </span><span className="font-bold text-amber-300">{hl.mostPerfect.sessionsPerfect}× 100%</span><span className="text-gray-300"> in einer Session</span></> : null },
                  { icon: '🔥', accent: 'border-orange-500',  label: 'Längste Winning-Streak (Sessions)',
                    content: hl.bestStreak ? <><span className="font-bold text-white">{hl.bestStreak.name}</span><span className="text-gray-300"> gewann </span><span className="font-bold text-orange-300">{hl.bestStreak.bestStreak} Sessions</span><span className="text-gray-300"> in Folge</span></> : null },
                  { icon: '⚡', accent: 'border-emerald-500', label: 'Aktuelle Session-Streak',
                    content: hl.currentStreak ? <><span className="font-bold text-white">{hl.currentStreak.name}</span><span className="text-gray-300"> ist seit </span><span className="font-bold text-emerald-300">{hl.currentStreak.currentStreak} Sessions</span><span className="text-gray-300"> auf einem Lauf 🔥</span></> : <span className="text-gray-500">Kein aktiver Streak</span> },
                  { icon: '🎯', accent: 'border-purple-500',  label: 'Meiste Siege gesamt (über alle Sessions)',
                    content: hl.mostTotalWins ? <><span className="font-bold text-white">{hl.mostTotalWins.name}</span><span className="text-gray-300"> — </span><span className="font-bold text-purple-300">{hl.mostTotalWins.totalWins} Siege</span><span className="text-xs text-gray-500 ml-1">in {hl.mostTotalWins.totalGames} Spielen</span></> : null },
                ];

                return (
                  <div className="mb-6">
                    <button
                      onClick={() => setSessionShowHighlights(v => !v)}
                      className="w-full flex items-center justify-between px-5 py-3 bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-750 transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <Award size={16} className="text-cyan-400" />
                        <span className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors">Globale Session-Highlights</span>
                        <span className="text-xs text-gray-500">— Rekorde über alle {hl.totalSessions} Sessions</span>
                      </div>
                      {sessionShowHighlights ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                    </button>
                    {sessionShowHighlights && (
                      <div className="mt-3">
                        {/* Year filter */}
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-xs text-gray-400 font-medium">Zeitraum:</span>
                          {['all', ...availableYears].map(y => (
                            <button
                              key={y}
                              onClick={() => setSessionHighlightYear(y)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${sessionHighlightYear === y ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                            >
                              {y === 'all' ? 'All Time' : `Season ${y}`}
                            </button>
                          ))}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                        {cards.map((card, i) => card.content && (
                          <div key={i} className={`bg-gray-800 rounded-xl border border-gray-700 border-l-4 ${card.accent} p-4`}>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">{card.icon}</span>
                              <span className="text-xs text-gray-400 font-medium">{card.label}</span>
                            </div>
                            <p className="text-sm leading-relaxed">{card.content}</p>
                          </div>
                        ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* MVP + Pechvogel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {mvp && (
                  <div className="bg-yellow-900 bg-opacity-30 border border-yellow-600 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Crown size={20} className="text-yellow-400" />
                      <span className="text-yellow-400 font-bold text-sm uppercase tracking-wide">Session MVP</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <button onClick={() => handlePlayerClick(mvp.name)} className="text-xl font-bold text-white hover:text-yellow-300 transition-colors">
                          👤 {mvp.name}
                        </button>
                        <div className="text-sm text-gray-400 mt-1">{mvp.wins}S / {mvp.losses}N • {mvp.games} Spiele</div>
                      </div>
                      <div className="text-4xl font-black text-yellow-400">{mvp.winrate}%</div>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                      <div className="h-2 rounded-full bg-gradient-to-r from-yellow-500 to-amber-400" style={{width:`${mvp.winrate}%`}} />
                    </div>
                  </div>
                )}
                {pechvogel && pechvogel.name !== mvp?.name && (
                  <div className="bg-red-900 bg-opacity-20 border border-red-700 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Skull size={20} className="text-red-400" />
                      <span className="text-red-400 font-bold text-sm uppercase tracking-wide">Pechvogel</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <button onClick={() => handlePlayerClick(pechvogel.name)} className="text-xl font-bold text-white hover:text-red-300 transition-colors">
                          👤 {pechvogel.name}
                        </button>
                        <div className="text-sm text-gray-400 mt-1">{pechvogel.wins}S / {pechvogel.losses}N • {pechvogel.games} Spiele</div>
                      </div>
                      <div className="text-4xl font-black text-red-400">{pechvogel.winrate}%</div>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                      <div className="h-2 rounded-full bg-red-600" style={{width:`${pechvogel.winrate}%`}} />
                    </div>
                  </div>
                )}
              </div>

              {/* Player Rankings */}
              <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden mb-6">
                <div className="px-5 py-4 border-b border-gray-700 flex items-center gap-2">
                  <Users size={18} className="text-cyan-400" />
                  <h3 className="font-bold text-white">Spieler-Rangliste</h3>
                  <span className="text-xs text-gray-500 ml-1">sortiert nach Winrate</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-900 border-b border-gray-700 text-gray-400 text-xs">
                        <th className="text-center py-3 px-3 w-10">#</th>
                        <th className="text-left py-3 px-4">Spieler</th>
                        <th className="text-center py-3 px-3">Spiele</th>
                        <th className="text-center py-3 px-3">Siege</th>
                        <th className="text-center py-3 px-3">Niederl.</th>
                        <th className="text-center py-3 px-4 text-cyan-400 font-semibold">Winrate</th>
                        <th className="text-center py-3 px-3 text-blue-400">💙 Gut</th>
                        <th className="text-center py-3 px-3 text-red-400">❤️ Böse</th>
                        <th className="text-left py-3 px-4">Rollen gespielt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessionPlayers.map((p, idx) => (
                        <tr key={p.name}
                          onClick={() => handlePlayerClick(p.name)}
                          className={`border-b border-gray-700 cursor-pointer transition-colors hover:bg-cyan-900 hover:bg-opacity-20 ${idx % 2 === 0 ? 'bg-gray-800' : ''}`}>
                          <td className="py-3 px-3 text-center">
                            {idx < 3
                              ? <span className="text-lg">{medals[idx]}</span>
                              : <span className="text-gray-500 font-mono text-sm">#{idx+1}</span>}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-white hover:text-cyan-300 transition-colors">👤 {p.name}</span>
                          </td>
                          <td className="py-3 px-3 text-center font-mono">{p.games}</td>
                          <td className="py-3 px-3 text-center font-mono text-green-400">{p.wins}</td>
                          <td className="py-3 px-3 text-center font-mono text-red-400">{p.losses}</td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className={`font-bold text-base ${p.winrate > 50 ? 'text-green-400' : p.winrate === 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                {p.winrate}%
                              </span>
                              <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${p.winrate > 50 ? 'bg-green-500' : p.winrate === 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                  style={{width:`${p.winrate}%`}} />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center">
                            {p.goodGames > 0 ? (
                              <div>
                                <span className={`font-bold text-sm ${p.goodWinrate >= 50 ? 'text-blue-300' : 'text-red-400'}`}>{p.goodWinrate}%</span>
                                <div className="text-xs text-gray-500">{p.goodWins}S/{p.goodGames - p.goodWins}N</div>
                              </div>
                            ) : <span className="text-gray-600">—</span>}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {p.evilGames > 0 ? (
                              <div>
                                <span className={`font-bold text-sm ${p.evilWinrate >= 50 ? 'text-red-300' : 'text-gray-400'}`}>{p.evilWinrate}%</span>
                                <div className="text-xs text-gray-500">{p.evilWins}S/{p.evilGames - p.evilWins}N</div>
                              </div>
                            ) : <span className="text-gray-600">—</span>}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {p.roles.map((r, i) => {
                                const catKey = getRoleCategory(r.role);
                                const cfg = CATEGORY_DISPLAY[catKey] || CATEGORY_DISPLAY.Sonstige;
                                return (
                                  <span key={i}
                                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.result === 'Sieg' ? 'ring-1 ring-green-500' : 'ring-1 ring-red-800'}`}
                                    style={{ backgroundColor: cfg.color + '22', color: cfg.color }}
                                    title={`Spiel #${r.gameId} • ${r.team} • ${r.result}`}>
                                    {cfg.emoji} {r.role}
                                  </span>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Game-by-game breakdown */}
              <div className="space-y-4">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Scroll size={18} className="text-cyan-400" />
                  Spiele dieser Session
                </h3>
                {sessionMatches.map((match, mIdx) => {
                  const goodPlayers = match.players.filter(p => p.team === 'Gut');
                  const evilPlayers = match.players.filter(p => p.team === 'Böse');
                  const goodWon = match.players.find(p => p.team === 'Gut')?.result === 'Sieg';

                  return (
                    <div key={match.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                      {/* Match header */}
                      <div className={`px-5 py-3 flex items-center justify-between border-b border-gray-700 ${goodWon ? 'bg-blue-900 bg-opacity-20' : 'bg-red-900 bg-opacity-20'}`}>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-gray-400 text-sm">Spiel #{match.id}</span>
                          <span className="text-white font-semibold">{match.script}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-sm font-bold px-3 py-1 rounded-full ${goodWon ? 'bg-blue-600 bg-opacity-60 text-blue-200' : 'bg-red-600 bg-opacity-60 text-red-200'}`}>
                            {goodWon ? '💙 Gut gewinnt' : '❤️ Böse gewinnt'}
                          </span>
                          {match.storyteller && match.storyteller !== 'Unknown' && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <BookOpen size={12} /> {match.storyteller}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Players split by team */}
                      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-700">
                        {/* Good team */}
                        <div className="p-4">
                          <div className="text-xs text-blue-400 font-semibold uppercase tracking-wide mb-3 flex items-center gap-1">
                            <Heart size={12} /> Gut ({goodPlayers.length})
                          </div>
                          <div className="space-y-1.5">
                            {goodPlayers.map((p, i) => {
                              const catKey = getRoleCategory(p.role);
                              const cfg = CATEGORY_DISPLAY[catKey] || CATEGORY_DISPLAY.Sonstige;
                              return (
                                <div key={i}
                                  onClick={() => handlePlayerClick(p.name)}
                                  className="flex items-center justify-between cursor-pointer hover:bg-gray-700 rounded px-2 py-1 transition-colors">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-white hover:text-blue-300">{p.name}</span>
                                    <span className="text-xs px-2 py-0.5 rounded-full" style={{backgroundColor: cfg.color+'22', color: cfg.color}}>
                                      {cfg.emoji} {p.role}
                                    </span>
                                  </div>
                                  <span className={`text-xs font-semibold ${p.result === 'Sieg' ? 'text-green-400' : 'text-red-400'}`}>
                                    {p.result === 'Sieg' ? '✓' : '✗'}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        {/* Evil team */}
                        <div className="p-4">
                          <div className="text-xs text-red-400 font-semibold uppercase tracking-wide mb-3 flex items-center gap-1">
                            <Skull size={12} /> Böse ({evilPlayers.length})
                          </div>
                          <div className="space-y-1.5">
                            {evilPlayers.map((p, i) => {
                              const catKey = getRoleCategory(p.role);
                              const cfg = CATEGORY_DISPLAY[catKey] || CATEGORY_DISPLAY.Sonstige;
                              return (
                                <div key={i}
                                  onClick={() => handlePlayerClick(p.name)}
                                  className="flex items-center justify-between cursor-pointer hover:bg-gray-700 rounded px-2 py-1 transition-colors">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-white hover:text-red-300">{p.name}</span>
                                    <span className="text-xs px-2 py-0.5 rounded-full" style={{backgroundColor: cfg.color+'22', color: cfg.color}}>
                                      {cfg.emoji} {p.role}
                                    </span>
                                  </div>
                                  <span className={`text-xs font-semibold ${p.result === 'Sieg' ? 'text-green-400' : 'text-red-400'}`}>
                                    {p.result === 'Sieg' ? '✓' : '✗'}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default BotCStatsTracker;