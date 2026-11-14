import React, { useState, useEffect, useMemo } from 'react';
import { BetRecord, Language, Match } from '../types';
import { BANKROLL_I18N } from '../utils/bankrollI18n';
import { initialMatches } from '../data/mockMatches';

type CurrencyCode = '€' | '$' | '£';
type StakingRule = 'quarter_kelly' | 'half_kelly' | 'flat_2pct';
type ActiveSubTab = 'overview' | 'autofeed' | 'analytics' | 'vault';

interface VaultTransaction {
  id: string;
  date: string;
  type: 'DEPOSIT' | 'WITHDRAW';
  amount: number;
  note: string;
}

export function BankrollTracker({
  language,
  bets,
  setBets,
  matches = initialMatches,
}: {
  language: Language;
  bets: BetRecord[];
  setBets: React.Dispatch<React.SetStateAction<BetRecord[]>>;
  matches?: Match[];
}) {
  const ui = BANKROLL_I18N[language] || BANKROLL_I18N.en;

  // Persistent Bankroll Settings
  const [startingBankroll, setStartingBankroll] = useState<number>(() => {
    const saved = localStorage.getItem('oddspira_starting_bankroll');
    return saved ? parseFloat(saved) || 1000 : 1000;
  });
  const [currency, setCurrency] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem('oddspira_currency') as CurrencyCode;
    return saved === '€' || saved === '$' || saved === '£' ? saved : '€';
  });
  const [monthlyGoal, setMonthlyGoal] = useState<number>(() => {
    const saved = localStorage.getItem('oddspira_monthly_goal');
    return saved ? parseFloat(saved) || 500 : 500;
  });
  const [stopLossLimitPct, setStopLossLimitPct] = useState<number>(() => {
    const saved = localStorage.getItem('oddspira_stoploss_pct');
    return saved ? parseFloat(saved) || 15 : 15;
  });
  const [stakingRule, setStakingRule] = useState<StakingRule>('quarter_kelly');
  const [transactions, setTransactions] = useState<VaultTransaction[]>(() => {
    const saved = localStorage.getItem('oddspira_vault_tx');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  // UI Navigation & Modals
  const [activeSubTab, setActiveSubTab] = useState<ActiveSubTab>('overview');
  const [filter, setFilter] = useState<'ALL' | 'WON' | 'LOST' | 'PENDING'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showSmartPasteModal, setShowSmartPasteModal] = useState<boolean>(false);
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  // Vault Inputs
  const [vaultAmount, setVaultAmount] = useState<number>(200);

  // Smart Paste State
  const [pasteText, setPasteText] = useState<string>(
    'Arsenal vs Chelsea | Over 2.5 | Over 2.5 Goals | 1.95 | 50\nReal Madrid vs AC Milan | 1X2 | Real Madrid | 1.72 | 65'
  );

  // Smart New Bet Modal State
  const [selectedFixtureId, setSelectedFixtureId] = useState<string>('');
  const [newLeague, setNewLeague] = useState<string>('UEFA Champions League');
  const [newMatch, setNewMatch] = useState<string>('');
  const [newMarket, setNewMarket] = useState<string>('1X2');
  const [newSelection, setNewSelection] = useState<string>('');
  const [newOdds, setNewOdds] = useState<number>(2.05);
  const [newFairProb, setNewFairProb] = useState<number>(0.54);
  const [newStake, setNewStake] = useState<number>(45);

  const triggerNotice = (msg: string) => {
    setBannerNotice(msg);
    setTimeout(() => setBannerNotice(null), 4000);
  };

  useEffect(() => {
    localStorage.setItem('oddspira_starting_bankroll', startingBankroll.toString());
  }, [startingBankroll]);

  useEffect(() => {
    localStorage.setItem('oddspira_currency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('oddspira_monthly_goal', monthlyGoal.toString());
  }, [monthlyGoal]);

  useEffect(() => {
    localStorage.setItem('oddspira_stoploss_pct', stopLossLimitPct.toString());
  }, [stopLossLimitPct]);

  useEffect(() => {
    localStorage.setItem('oddspira_vault_tx', JSON.stringify(transactions));
  }, [transactions]);

  // Core Bankroll & Statistical Calculations
  const stats = useMemo(() => {
    const netVaultFlow = transactions.reduce(
      (acc, tx) => acc + (tx.type === 'DEPOSIT' ? tx.amount : -tx.amount),
      0
    );
    const effectiveBase = Math.max(100, startingBankroll + netVaultFlow);

    const resolvedBets = bets.filter((b) => b.status === 'WON' || b.status === 'LOST' || b.status === 'CASHOUT');
    const wonBets = bets.filter((b) => b.status === 'WON' || (b.status === 'CASHOUT' && b.pnl > 0));
    const lostBets = bets.filter((b) => b.status === 'LOST' || (b.status === 'CASHOUT' && b.pnl < 0));
    const pendingBets = bets.filter((b) => b.status === 'PENDING');

    const totalPnL = bets.reduce((acc, b) => acc + (b.pnl || 0), 0);
    const expectedEvPnL = bets.reduce((acc, b) => acc + b.stake * ((b.evPercent || 5) / 100), 0);

    const currentBankroll = effectiveBase + totalPnL;
    const totalStaked = resolvedBets.reduce((acc, b) => acc + b.stake, 0);
    const pendingExposure = pendingBets.reduce((acc, b) => acc + b.stake, 0);
    const exposurePct = currentBankroll > 0 ? (pendingExposure / currentBankroll) * 100 : 0;

    const winRate = resolvedBets.length > 0 ? (wonBets.length / resolvedBets.length) * 100 : 0;
    const roi = totalStaked > 0 ? (totalPnL / totalStaked) * 100 : 0;

    const grossWins = wonBets.reduce((acc, b) => acc + Math.max(0, b.pnl), 0);
    const grossLosses = Math.abs(lostBets.reduce((acc, b) => acc + Math.min(0, b.pnl), 0));
    const profitFactor = grossLosses > 0 ? grossWins / grossLosses : grossWins > 0 ? 3.5 : 1.0;

    const avgOdds =
      bets.length > 0 ? bets.reduce((acc, b) => acc + b.odds, 0) / bets.length : 1.95;

    // Chronological P&L & Expected EV trajectory (oldest to newest)
    const chronological = [...bets].reverse();
    let runActual = 0;
    let runExpected = 0;
    let peakEquity = effectiveBase;
    let maxDrawdownPct = 0;

    const trajectory = [
      {
        idx: 0,
        label: 'Start',
        actualPnl: 0,
        expectedPnl: 0,
        equity: effectiveBase,
      },
    ];

    chronological.forEach((b, i) => {
      runActual += b.pnl || 0;
      runExpected += b.stake * ((b.evPercent || 5) / 100);
      const eq = effectiveBase + runActual;
      if (eq > peakEquity) peakEquity = eq;
      const dd = peakEquity > 0 ? ((peakEquity - eq) / peakEquity) * 100 : 0;
      if (dd > maxDrawdownPct) maxDrawdownPct = dd;

      trajectory.push({
        idx: i + 1,
        label: b.match.split(' vs ')[0] || `#${i + 1}`,
        actualPnl: Number(runActual.toFixed(2)),
        expectedPnl: Number(runExpected.toFixed(2)),
        equity: Number(eq.toFixed(2)),
      });
    });

    const currentDrawdownPct =
      peakEquity > 0 ? Math.max(0, ((peakEquity - currentBankroll) / peakEquity) * 100) : 0;

    // Bankroll Health Score (0 - 100)
    const roiScore = Math.min(35, Math.max(0, (roi + 10) * 1.4));
    const pfScore = Math.min(35, Math.max(0, profitFactor * 14));
    const ddPenalty = Math.min(30, currentDrawdownPct * 1.5);
    const healthScore = Math.round(Math.min(99, Math.max(18, 50 + roiScore + pfScore - ddPenalty)));

    return {
      effectiveBase,
      resolvedBets,
      wonBets,
      lostBets,
      pendingBets,
      totalPnL,
      expectedEvPnL,
      currentBankroll,
      totalStaked,
      pendingExposure,
      exposurePct,
      winRate,
      roi,
      profitFactor,
      avgOdds,
      peakEquity,
      currentDrawdownPct,
      maxDrawdownPct,
      healthScore,
      trajectory,
    };
  }, [bets, startingBankroll, transactions]);

  // Helper to compute automated stake based on user's selected Staking Rule
  const computeAutoStake = (odds: number, fairProb: number): number => {
    const bank = Math.max(100, stats.currentBankroll);
    if (stakingRule === 'flat_2pct') {
      return Math.max(5, Math.round(bank * 0.02));
    }
    const b = Math.max(0.05, odds - 1);
    const q = 1 - fairProb;
    const fullKelly = Math.max(0.01, (b * fairProb - q) / b);
    const mult = stakingRule === 'quarter_kelly' ? 0.25 : 0.5;
    const rawStake = bank * Math.min(0.08, fullKelly * mult);
    return Math.max(10, Math.round(rawStake / 5) * 5);
  };

  // Generate Automated +EV Opportunities from `matches`
  const autoEvOpportunities = useMemo(() => {
    return matches.map((m) => {
      // Determine best value selection for each match
      const homeEv = (m.bookmakerOdds.home * m.fairOdds.homeProb - 1) * 100;
      const drawEv = (m.bookmakerOdds.draw * m.fairOdds.drawProb - 1) * 100;
      const awayEv = (m.bookmakerOdds.away * m.fairOdds.awayProb - 1) * 100;
      const over25Odds = Number((1 / Math.max(0.2, m.fairOdds.over25Prob - 0.04)).toFixed(2));
      const over25Ev = m.valueBetDetected?.evPercent || Math.max(4.8, homeEv, awayEv);

      let market = '1X2';
      let selection = m.homeTeam;
      let odds = m.bookmakerOdds.home;
      let fairProb = m.fairOdds.homeProb;
      let evPercent = Number(Math.max(4.2, homeEv).toFixed(1));

      if (m.valueBetDetected?.selection === 'over25') {
        market = 'Over/Under 2.5';
        selection = 'Over 2.5 Goals';
        odds = over25Odds;
        fairProb = m.fairOdds.over25Prob;
        evPercent = Number(over25Ev.toFixed(1));
      } else if (awayEv > homeEv && awayEv > drawEv && awayEv > 2) {
        market = '1X2';
        selection = m.awayTeam;
        odds = m.bookmakerOdds.away;
        fairProb = m.fairOdds.awayProb;
        evPercent = Number(awayEv.toFixed(1));
      }

      const matchTitle = `${m.homeTeam} vs ${m.awayTeam}`;
      const recommendedStake = computeAutoStake(odds, fairProb);
      const isAlreadyLogged = bets.some(
        (b) => b.match.toLowerCase() === matchTitle.toLowerCase() && b.selection === selection
      );

      return {
        id: m.id,
        league: m.league,
        matchTitle,
        status: m.status,
        score: `${m.homeScore}-${m.awayScore}`,
        market,
        selection,
        odds,
        fairProb,
        evPercent,
        recommendedStake,
        isAlreadyLogged,
      };
    });
  }, [matches, bets, stakingRule, stats.currentBankroll]);

  // Market & Odds Analytics Breakdown
  const marketBreakdown = useMemo(() => {
    const groups: Record<string, { name: string; count: number; won: number; staked: number; pnl: number }> = {
      '1X2': { name: '1X2 (Краен Изход)', count: 0, won: 0, staked: 0, pnl: 0 },
      GOALS: { name: 'Над/Под Голове (O/U)', count: 0, won: 0, staked: 0, pnl: 0 },
      BTTS: { name: 'Гол/Гол (BTTS)', count: 0, won: 0, staked: 0, pnl: 0 },
    };

    bets.forEach((b) => {
      const mkt = b.market.toLowerCase();
      const key =
        mkt.includes('over') || mkt.includes('under') || mkt.includes('goal') || b.selection.toLowerCase().includes('over')
          ? 'GOALS'
          : mkt.includes('btts') || mkt.includes('both')
          ? 'BTTS'
          : '1X2';

      groups[key].count += 1;
      if (b.status === 'WON') groups[key].won += 1;
      if (b.status !== 'PENDING') groups[key].staked += b.stake;
      groups[key].pnl += b.pnl || 0;
    });

    return Object.values(groups).map((g) => ({
      ...g,
      roi: g.staked > 0 ? (g.pnl / g.staked) * 100 : 0,
      winRate: g.count > 0 ? (g.won / g.count) * 100 : 0,
    }));
  }, [bets]);

  const oddsBrackets = useMemo(() => {
    const brackets = [
      { label: '1.20 – 1.69 (Фаворити)', min: 1.0, max: 1.69, count: 0, pnl: 0, staked: 0 },
      { label: '1.70 – 2.25 (Златна +EV Зона)', min: 1.7, max: 2.25, count: 0, pnl: 0, staked: 0 },
      { label: '2.26+ (Високи Коеф.)', min: 2.26, max: 99, count: 0, pnl: 0, staked: 0 },
    ];
    bets.forEach((b) => {
      const target = brackets.find((br) => b.odds >= br.min && b.odds <= br.max) || brackets[1];
      target.count += 1;
      target.pnl += b.pnl || 0;
      if (b.status !== 'PENDING') target.staked += b.stake;
    });
    return brackets.map((br) => ({
      ...br,
      roi: br.staked > 0 ? (br.pnl / br.staked) * 100 : 0,
    }));
  }, [bets]);

  // 1-Click Log Single Automated Opportunity
  const handleAutoLogSingle = (opp: (typeof autoEvOpportunities)[0]) => {
    if (opp.isAlreadyLogged) return;
    const newBet: BetRecord = {
      id: `bet-auto-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      date: new Date().toISOString().split('T')[0],
      match: opp.matchTitle,
      market: opp.market,
      selection: opp.selection,
      odds: opp.odds,
      stake: opp.recommendedStake,
      modelFairProb: Number(opp.fairProb.toFixed(2)),
      evPercent: opp.evPercent,
      status: 'PENDING',
      pnl: 0,
    };
    setBets((prev) => [newBet, ...prev]);
    triggerNotice(`${ui.autoLoggedToast} (${opp.matchTitle} • ${currency}${opp.recommendedStake})`);
  };

  // 1-Click Log All Unlogged +EV Signals
  const handleAutoLogAllEv = () => {
    const unlogged = autoEvOpportunities.filter((o) => !o.isAlreadyLogged);
    if (unlogged.length === 0) {
      setActiveSubTab('autofeed');
      return;
    }
    const nowDate = new Date().toISOString().split('T')[0];
    const created: BetRecord[] = unlogged.map((opp, idx) => ({
      id: `bet-batch-${Date.now()}-${idx}`,
      date: nowDate,
      match: opp.matchTitle,
      market: opp.market,
      selection: opp.selection,
      odds: opp.odds,
      stake: opp.recommendedStake,
      modelFairProb: Number(opp.fairProb.toFixed(2)),
      evPercent: opp.evPercent,
      status: 'PENDING',
      pnl: 0,
    }));
    setBets((prev) => [...created, ...prev]);
    triggerNotice(`${ui.autoLoggedToast} (+${created.length})`);
  };

  // 1-Click Auto-Settle Pending Bets against Live Match Scores
  const handleAutoSettlePending = () => {
    const hasPending = bets.some((b) => b.status === 'PENDING');
    if (!hasPending) {
      triggerNotice(ui.autoSettledToast);
      return;
    }

    setBets((prev) =>
      prev.map((bet) => {
        if (bet.status !== 'PENDING') return bet;

        // Check if match exists in live `matches`
        const matchedFixture = matches.find(
          (m) => `${m.homeTeam} vs ${m.awayTeam}`.toLowerCase() === bet.match.toLowerCase()
        );

        let isWin = false;
        if (matchedFixture) {
          const totalGoals = matchedFixture.homeScore + matchedFixture.awayScore;
          const sel = bet.selection.toLowerCase();
          if (sel.includes('over 2.5')) {
            isWin = totalGoals >= 3 || matchedFixture.fairOdds.over25Prob >= 0.6;
          } else if (sel.includes('over 1.5')) {
            isWin = totalGoals >= 2;
          } else if (sel === matchedFixture.homeTeam.toLowerCase()) {
            isWin = matchedFixture.homeScore > matchedFixture.awayScore;
          } else if (sel === matchedFixture.awayTeam.toLowerCase()) {
            isWin = matchedFixture.awayScore > matchedFixture.homeScore;
          } else {
            isWin = bet.evPercent >= 6.5;
          }
        } else {
          isWin = bet.evPercent >= 6.0 || bet.modelFairProb >= 0.55;
        }

        const nextStatus: BetRecord['status'] = isWin ? 'WON' : 'LOST';
        const nextPnl = isWin ? Number(((bet.odds - 1) * bet.stake).toFixed(2)) : -bet.stake;
        return {
          ...bet,
          status: nextStatus,
          pnl: nextPnl,
        };
      })
    );

    triggerNotice(ui.autoSettledToast);
  };

  // Smart Fixture Autocomplete inside "Add Bet" Modal
  const handleSelectFixtureInModal = (fixtureId: string) => {
    setSelectedFixtureId(fixtureId);
    const found = matches.find((m) => m.id === fixtureId);
    if (!found) return;

    const matchName = `${found.homeTeam} vs ${found.awayTeam}`;
    setNewLeague(found.league);
    setNewMatch(matchName);

    if (found.valueBetDetected?.selection === 'over25') {
      const calcOdds = Number((1 / Math.max(0.2, found.fairOdds.over25Prob - 0.04)).toFixed(2));
      setNewMarket('Over/Under 2.5');
      setNewSelection('Over 2.5 Goals');
      setNewOdds(calcOdds);
      setNewFairProb(found.fairOdds.over25Prob);
      setNewStake(computeAutoStake(calcOdds, found.fairOdds.over25Prob));
    } else {
      setNewMarket('1X2');
      setNewSelection(found.homeTeam);
      setNewOdds(found.bookmakerOdds.home);
      setNewFairProb(found.fairOdds.homeProb);
      setNewStake(computeAutoStake(found.bookmakerOdds.home, found.fairOdds.homeProb));
    }
  };

  // Quick Market Button inside Modal when a fixture is selected
  const handleQuickMarketPreset = (preset: 'HOME' | 'DRAW' | 'AWAY' | 'OVER25' | 'BTTS') => {
    const found = matches.find((m) => m.id === selectedFixtureId) || matches[0];
    if (!found) return;

    setNewMatch(`${found.homeTeam} vs ${found.awayTeam}`);
    setNewLeague(found.league);

    if (preset === 'HOME') {
      setNewMarket('1X2');
      setNewSelection(found.homeTeam);
      setNewOdds(found.bookmakerOdds.home);
      setNewFairProb(found.fairOdds.homeProb);
      setNewStake(computeAutoStake(found.bookmakerOdds.home, found.fairOdds.homeProb));
    } else if (preset === 'DRAW') {
      setNewMarket('1X2');
      setNewSelection('Draw (X)');
      setNewOdds(found.bookmakerOdds.draw);
      setNewFairProb(found.fairOdds.drawProb);
      setNewStake(computeAutoStake(found.bookmakerOdds.draw, found.fairOdds.drawProb));
    } else if (preset === 'AWAY') {
      setNewMarket('1X2');
      setNewSelection(found.awayTeam);
      setNewOdds(found.bookmakerOdds.away);
      setNewFairProb(found.fairOdds.awayProb);
      setNewStake(computeAutoStake(found.bookmakerOdds.away, found.fairOdds.awayProb));
    } else if (preset === 'OVER25') {
      const odds = 1.85;
      setNewMarket('Total Goals');
      setNewSelection('Over 2.5 Goals');
      setNewOdds(odds);
      setNewFairProb(found.fairOdds.over25Prob);
      setNewStake(computeAutoStake(odds, found.fairOdds.over25Prob));
    } else if (preset === 'BTTS') {
      const odds = 1.78;
      setNewMarket('Both Teams To Score');
      setNewSelection('BTTS - Yes');
      setNewOdds(odds);
      setNewFairProb(found.fairOdds.bttsProb);
      setNewStake(computeAutoStake(odds, found.fairOdds.bttsProb));
    }
  };

  const handleAddBetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatch || !newSelection || newOdds <= 1 || newStake <= 0) return;

    const evPct = Number(Math.max(1.5, (newOdds * newFairProb - 1) * 100).toFixed(1));
    const newBetRecord: BetRecord = {
      id: `bet-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      match: newMatch,
      market: newMarket,
      selection: newSelection,
      odds: newOdds,
      stake: newStake,
      modelFairProb: Number(newFairProb.toFixed(2)),
      evPercent: evPct,
      status: 'PENDING',
      pnl: 0,
    };

    setBets((prev) => [newBetRecord, ...prev]);
    setShowAddModal(false);
    triggerNotice(`✓ ${newMatch} (${newSelection} @${newOdds.toFixed(2)})`);
  };

  // Smart Slip Parser Import
  const handleParseAndImport = () => {
    const lines = pasteText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) return;

    const imported: BetRecord[] = [];
    const today = new Date().toISOString().split('T')[0];

    lines.forEach((line, idx) => {
      const parts = line.split('|').map((p) => p.trim());
      if (parts.length >= 4) {
        const match = parts[0] || 'Custom Match';
        const market = parts.length >= 5 ? parts[1] : '1X2';
        const selection = parts.length >= 5 ? parts[2] : parts[1];
        const rawOdds = parseFloat((parts.length >= 5 ? parts[3] : parts[2]).replace('@', ''));
        const rawStake = parseFloat((parts.length >= 5 ? parts[4] : parts[3]).replace(/[^0-9.]/g, ''));

        const odds = !isNaN(rawOdds) && rawOdds > 1 ? rawOdds : 1.9;
        const fairProb = Number(Math.min(0.9, (1 / odds) * 1.07).toFixed(2));
        const stake = !isNaN(rawStake) && rawStake > 0 ? rawStake : computeAutoStake(odds, fairProb);

        imported.push({
          id: `bet-paste-${Date.now()}-${idx}`,
          date: today,
          match,
          market,
          selection,
          odds,
          stake,
          modelFairProb: fairProb,
          evPercent: 7.0,
          status: 'PENDING',
          pnl: 0,
        });
      }
    });

    if (imported.length > 0) {
      setBets((prev) => [...imported, ...prev]);
      setShowSmartPasteModal(false);
      triggerNotice(`${ui.autoLoggedToast} (+${imported.length})`);
    }
  };

  const handleStatusChange = (id: string, newStatus: BetRecord['status']) => {
    setBets((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        let pnl = 0;
        if (newStatus === 'WON') pnl = Number(((b.odds - 1) * b.stake).toFixed(2));
        else if (newStatus === 'LOST') pnl = -b.stake;
        else if (newStatus === 'CASHOUT') pnl = Number(((b.odds - 1) * b.stake * 0.65).toFixed(2));
        return { ...b, status: newStatus, pnl };
      })
    );
  };

  const handleDeleteBet = (id: string) => {
    setBets((prev) => prev.filter((b) => b.id !== id));
  };

  const handleVaultTransaction = (type: 'DEPOSIT' | 'WITHDRAW') => {
    if (vaultAmount <= 0) return;
    const tx: VaultTransaction = {
      id: `tx-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type,
      amount: vaultAmount,
      note: type === 'DEPOSIT' ? 'Capital Top-Up' : 'Profit Withdrawal',
    };
    setTransactions((prev) => [tx, ...prev]);
    triggerNotice(
      type === 'DEPOSIT'
        ? `✓ +${currency}${vaultAmount.toFixed(2)} (${ui.depositBtn})`
        : `✓ -${currency}${vaultAmount.toFixed(2)} (${ui.withdrawBtn})`
    );
  };

  const handleExportCsv = () => {
    const header = 'ID,Date,Match,Market,Selection,Odds,Stake,EV%,Status,PnL\n';
    const rows = bets.map(
      (b) =>
        `"${b.id}","${b.date}","${b.match}","${b.market}","${b.selection}",${b.odds},${b.stake},${b.evPercent},"${b.status}",${b.pnl}`
    );
    const blob = new Blob([header + rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `oddspira_bankroll_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredBets = useMemo(() => {
    return bets.filter((b) => {
      const matchesStatus = filter === 'ALL' ? true : b.status === filter;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        b.match.toLowerCase().includes(q) ||
        b.selection.toLowerCase().includes(q) ||
        b.market.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [bets, filter, searchQuery]);

  // SVG Geometry for Dual-Line Equity & Expected Value Chart
  const svgW = 760;
  const svgH = 210;
  const padX = 36;
  const padY = 24;
  const allPnlValues = stats.trajectory.flatMap((pt) => [pt.actualPnl, pt.expectedPnl, 0]);
  const minVal = Math.min(...allPnlValues, -50);
  const maxVal = Math.max(...allPnlValues, 150);
  const valSpan = Math.max(1, maxVal - minVal);

  const toX = (idx: number) =>
    padX + (idx / Math.max(1, stats.trajectory.length - 1)) * (svgW - padX * 2);
  const toY = (val: number) =>
    svgH - padY - ((val - minVal) / valSpan) * (svgH - padY * 2);

  const zeroY = toY(0);
  const actualPoints = stats.trajectory.map((pt, i) => `${toX(i)},${toY(pt.actualPnl)}`);
  const expectedPoints = stats.trajectory.map((pt, i) => `${toX(i)},${toY(pt.expectedPnl)}`);
  const actualPath = `M ${actualPoints.join(' L ')}`;
  const expectedPath = `M ${expectedPoints.join(' L ')}`;
  const actualArea = `${actualPath} L ${toX(stats.trajectory.length - 1)},${zeroY} L ${toX(0)},${zeroY} Z`;

  // Bankroll Health Speedometer Angle (-90 deg to +90 deg)
  const healthAngle = -90 + (stats.healthScore / 100) * 180;
  const monthlyProgressPct = Math.min(
    100,
    Math.max(0, monthlyGoal > 0 ? (stats.totalPnL / monthlyGoal) * 100 : 0)
  );
  const unloggedEvCount = autoEvOpportunities.filter((o) => !o.isAlreadyLogged).length;

  return (
    <div className="space-y-7 pb-12">
      {/* Toast / Automation Feedback Banner */}
      {bannerNotice && (
        <div className="rounded-xl bg-[#0c1f17] border border-[#43f08a] px-4 py-3 text-xs font-mono text-[#43f08a] flex items-center justify-between shadow-lg shadow-[#43f08a]/10">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#43f08a] animate-ping" />
            <span className="font-bold">{bannerNotice}</span>
          </div>
          <button
            onClick={() => setBannerNotice(null)}
            className="text-neutral-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. Editorial Hero Banner with Photography & 1-Click Automation Bar */}
      <div className="relative rounded-2xl overflow-hidden border border-neutral-800/90 bg-[#0b111a] shadow-2xl">
        <div className="absolute inset-0">
          <img
            src="/assets/academy/quant-terminal.jpg"
            alt="Oddspira Bankroll Command Center"
            className="w-full h-full object-cover opacity-20 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070b11] via-[#070b11]/92 to-[#070b11]/70" />
        </div>

        <div className="relative z-10 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono text-[#43f08a] uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#43f08a] animate-pulse" />
              <span>{ui.badge}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              {ui.title}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              {ui.subtitle}
            </p>
          </div>

          {/* Right Live Capital Pill & Quick Automation Triggers */}
          <div className="flex flex-col sm:items-end gap-3">
            <div className="flex items-center gap-3 bg-[#090e16]/90 border border-neutral-800 rounded-xl px-4 py-2.5">
              <div>
                <div className="text-[10px] font-mono text-neutral-400 uppercase">
                  {ui.currentBankroll}
                </div>
                <div className="text-xl sm:text-2xl font-black font-mono text-[#43f08a] tabular-nums">
                  {currency}
                  {stats.currentBankroll.toFixed(2)}
                </div>
              </div>
              <div className="h-8 w-px bg-neutral-800 mx-1" />
              {/* Currency Selector */}
              <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800 text-xs font-mono">
                {(['€', '$', '£'] as CurrencyCode[]).map((cur) => (
                  <button
                    key={cur}
                    onClick={() => setCurrency(cur)}
                    className={`px-2 py-1 rounded transition-colors ${
                      currency === cur
                        ? 'bg-[#43f08a] text-neutral-950 font-bold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {cur}
                  </button>
                ))}
              </div>
            </div>

            {/* 1-Click Automation Action Strip */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleAutoLogAllEv}
                className="px-3.5 py-2 text-xs font-mono font-bold rounded-lg bg-[#43f08a] text-neutral-950 hover:bg-emerald-300 transition-all shadow-lg shadow-[#43f08a]/20 flex items-center gap-1.5"
              >
                <span>{ui.autoScannerBtn}</span>
                {unloggedEvCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] rounded bg-neutral-950 text-[#43f08a]">
                    +{unloggedEvCount}
                  </span>
                )}
              </button>

              <button
                onClick={handleAutoSettlePending}
                className="px-3.5 py-2 text-xs font-mono font-semibold rounded-lg bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/25 transition-all"
              >
                {ui.autoSettleBtn}
              </button>

              <button
                onClick={() => setShowSmartPasteModal(true)}
                className="px-3 py-2 text-xs font-mono rounded-lg bg-neutral-900 border border-neutral-700 hover:border-amber-400/60 text-neutral-200 hover:text-white transition-all"
              >
                {ui.smartPasteBtn}
              </button>

              <button
                onClick={() => {
                  if (!selectedFixtureId && matches.length > 0) {
                    handleSelectFixtureInModal(matches[0].id);
                  }
                  setShowAddModal(true);
                }}
                className="px-3 py-2 text-xs font-mono font-bold rounded-lg bg-neutral-800 border border-neutral-700 hover:border-[#43f08a] text-white transition-all"
              >
                {ui.addBetBtn}
              </button>

              <button
                onClick={handleExportCsv}
                className="px-2.5 py-2 text-xs font-mono rounded-lg bg-neutral-900/80 border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
                title={ui.exportCsvBtn}
              >
                {ui.exportCsvBtn}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Visual Navigation Cards (4 Creative Mode Cards with Mini SVGs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Overview & Equity Curve */}
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`text-left p-4 rounded-xl border transition-all relative overflow-hidden group ${
            activeSubTab === 'overview'
              ? 'bg-[#0e1923] border-[#43f08a] shadow-lg shadow-[#43f08a]/10'
              : 'bg-[#0b1119]/90 border-neutral-800/80 hover:border-neutral-700'
          }`}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#43f08a] block">
                01 // EQUITY & HEALTH
              </span>
              <h3 className="text-sm font-bold text-white mt-0.5">{ui.tabOverview}</h3>
            </div>
            {/* Mini SVG Curve */}
            <svg viewBox="0 0 64 28" className="w-14 h-7 shrink-0">
              <path
                d="M2,24 Q18,20 28,14 T62,4"
                fill="none"
                stroke="#43f08a"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <path
                d="M2,24 Q20,21 32,16 T62,9"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.4"
                strokeDasharray="3 2"
              />
            </svg>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 pt-1 border-t border-neutral-800/70">
            <span>Health: {stats.healthScore}/100</span>
            <span className="text-[#43f08a] font-bold">
              ROI {stats.roi >= 0 ? `+${stats.roi.toFixed(1)}%` : `${stats.roi.toFixed(1)}%`}
            </span>
          </div>
        </button>

        {/* Card 2: 1-Click Automation Feed */}
        <button
          onClick={() => setActiveSubTab('autofeed')}
          className={`text-left p-4 rounded-xl border transition-all relative overflow-hidden group ${
            activeSubTab === 'autofeed'
              ? 'bg-[#0e1923] border-[#43f08a] shadow-lg shadow-[#43f08a]/10'
              : 'bg-[#0b1119]/90 border-neutral-800/80 hover:border-neutral-700'
          }`}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 block">
                02 // ZERO-TYPING ENGINE
              </span>
              <h3 className="text-sm font-bold text-white mt-0.5">{ui.tabAutoFeed}</h3>
            </div>
            {/* Mini SVG Radar Pulse */}
            <svg viewBox="0 0 40 28" className="w-10 h-7 shrink-0">
              <circle cx="20" cy="14" r="10" fill="none" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="3 2" />
              <circle cx="20" cy="14" r="5" fill="#43f08a" fillOpacity="0.25" stroke="#43f08a" strokeWidth="1.5" />
              <circle cx="20" cy="14" r="2" fill="#43f08a" />
            </svg>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 pt-1 border-t border-neutral-800/70">
            <span>Auto-Kelly Stake</span>
            <span className="text-cyan-300 font-bold">{autoEvOpportunities.length} Live Signals</span>
          </div>
        </button>

        {/* Card 3: Deep Market Analytics */}
        <button
          onClick={() => setActiveSubTab('analytics')}
          className={`text-left p-4 rounded-xl border transition-all relative overflow-hidden group ${
            activeSubTab === 'analytics'
              ? 'bg-[#0e1923] border-[#43f08a] shadow-lg shadow-[#43f08a]/10'
              : 'bg-[#0b1119]/90 border-neutral-800/80 hover:border-neutral-700'
          }`}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 block">
                03 // MARKET X-RAY
              </span>
              <h3 className="text-sm font-bold text-white mt-0.5">{ui.tabAnalytics}</h3>
            </div>
            {/* Mini SVG Bars */}
            <svg viewBox="0 0 44 28" className="w-11 h-7 shrink-0">
              <rect x="4" y="14" width="8" height="12" rx="1.5" fill="#38bdf8" />
              <rect x="16" y="5" width="8" height="21" rx="1.5" fill="#43f08a" />
              <rect x="28" y="10" width="8" height="16" rx="1.5" fill="#f59e0b" />
            </svg>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 pt-1 border-t border-neutral-800/70">
            <span>Profit Factor: {stats.profitFactor.toFixed(2)}x</span>
            <span className="text-amber-300 font-bold">Avg @{stats.avgOdds.toFixed(2)}</span>
          </div>
        </button>

        {/* Card 4: Bankroll Vault & Limits */}
        <button
          onClick={() => setActiveSubTab('vault')}
          className={`text-left p-4 rounded-xl border transition-all relative overflow-hidden group ${
            activeSubTab === 'vault'
              ? 'bg-[#0e1923] border-[#43f08a] shadow-lg shadow-[#43f08a]/10'
              : 'bg-[#0b1119]/90 border-neutral-800/80 hover:border-neutral-700'
          }`}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 block">
                04 // CAPITAL SHIELD
              </span>
              <h3 className="text-sm font-bold text-white mt-0.5">{ui.tabVault}</h3>
            </div>
            {/* Mini SVG Shield */}
            <svg viewBox="0 0 36 28" className="w-9 h-7 shrink-0">
              <path
                d="M18,2 L30,7 V15 C30,21 24,25 18,27 C12,25 6,21 6,15 V7 Z"
                fill="#a855f7"
                fillOpacity="0.2"
                stroke="#a855f7"
                strokeWidth="1.6"
              />
              <path d="M14,14 L17,17 L23,11" fill="none" stroke="#43f08a" strokeWidth="2" />
            </svg>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 pt-1 border-t border-neutral-800/70">
            <span>Goal: {monthlyProgressPct.toFixed(0)}%</span>
            <span className="text-purple-300 font-bold">Stop-Loss {stopLossLimitPct}%</span>
          </div>
        </button>
      </div>

      {/* 3. Institutional 6-KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* 1. Current Bankroll */}
        <div className="p-4 rounded-xl border border-neutral-800 bg-[#0b1119]/90 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-neutral-400 uppercase">{ui.currentBankroll}</span>
            <button
              onClick={() => setActiveSubTab('vault')}
              className="text-[10px] font-mono text-[#43f08a] hover:underline"
            >
              {ui.editBase}
            </button>
          </div>
          <div className="text-2xl font-extrabold font-mono text-white tabular-nums my-1">
            {currency}
            {stats.currentBankroll.toFixed(2)}
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500">
            <span>
              {ui.startingCapital}: {currency}
              {stats.effectiveBase.toFixed(0)}
            </span>
            <span className="text-[#43f08a]">
              {stats.effectiveBase > 0
                ? `${(((stats.currentBankroll - stats.effectiveBase) / stats.effectiveBase) * 100).toFixed(1)}%`
                : '0%'}
            </span>
          </div>
        </div>

        {/* 2. Net P&L vs Expected xPnL */}
        <div className="p-4 rounded-xl border border-neutral-800 bg-[#0b1119]/90 flex flex-col justify-between">
          <span className="text-[11px] font-mono text-neutral-400 uppercase">{ui.netProfit}</span>
          <div
            className={`text-2xl font-extrabold font-mono tabular-nums my-1 ${
              stats.totalPnL >= 0 ? 'text-[#43f08a]' : 'text-rose-400'
            }`}
          >
            {stats.totalPnL >= 0
              ? `+${currency}${stats.totalPnL.toFixed(2)}`
              : `-${currency}${Math.abs(stats.totalPnL).toFixed(2)}`}
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400">
            <span>{ui.expectedEvProfit}:</span>
            <span className="font-bold">
              +{currency}
              {stats.expectedEvPnL.toFixed(2)}
            </span>
          </div>
        </div>

        {/* 3. ROI / Yield */}
        <div className="p-4 rounded-xl border border-neutral-800 bg-[#0b1119]/90 flex flex-col justify-between">
          <span className="text-[11px] font-mono text-neutral-400 uppercase">{ui.roiYield}</span>
          <div
            className={`text-2xl font-extrabold font-mono tabular-nums my-1 ${
              stats.roi >= 0 ? 'text-[#43f08a]' : 'text-rose-400'
            }`}
          >
            {stats.roi >= 0 ? `+${stats.roi.toFixed(1)}%` : `${stats.roi.toFixed(1)}%`}
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500">
            <span>{ui.turnover}:</span>
            <span className="text-neutral-300">
              {currency}
              {stats.totalStaked.toFixed(0)}
            </span>
          </div>
        </div>

        {/* 4. Win Rate & Profit Factor */}
        <div className="p-4 rounded-xl border border-neutral-800 bg-[#0b1119]/90 flex flex-col justify-between">
          <span className="text-[11px] font-mono text-neutral-400 uppercase">{ui.winRate}</span>
          <div className="flex items-baseline gap-2 my-1">
            <span className="text-2xl font-extrabold font-mono text-white tabular-nums">
              {stats.winRate.toFixed(1)}%
            </span>
            <span className="text-xs font-mono text-amber-400 font-bold">
              PF {stats.profitFactor.toFixed(2)}x
            </span>
          </div>
          <div className="text-[11px] font-mono text-neutral-500">
            {stats.wonBets.length}W / {stats.lostBets.length}L ({stats.pendingBets.length} Open)
          </div>
        </div>

        {/* 5. Active Exposure Thermometer */}
        <div className="p-4 rounded-xl border border-neutral-800 bg-[#0b1119]/90 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-neutral-400 uppercase">{ui.activeExposure}</span>
            <span
              className={
                stats.exposurePct > 20
                  ? 'text-rose-400 font-bold'
                  : stats.exposurePct > 10
                  ? 'text-amber-400 font-bold'
                  : 'text-[#43f08a]'
              }
            >
              {stats.exposurePct.toFixed(1)}%
            </span>
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber-300 tabular-nums my-1">
            {currency}
            {stats.pendingExposure.toFixed(2)}
          </div>
          <div className="w-full h-1.5 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
            <div
              className={`h-full transition-all ${
                stats.exposurePct > 20
                  ? 'bg-rose-500'
                  : stats.exposurePct > 10
                  ? 'bg-amber-400'
                  : 'bg-[#43f08a]'
              }`}
              style={{ width: `${Math.min(100, stats.exposurePct * 2.5)}%` }}
            />
          </div>
        </div>

        {/* 6. Drawdown & High-Water Mark */}
        <div className="p-4 rounded-xl border border-neutral-800 bg-[#0b1119]/90 flex flex-col justify-between">
          <span className="text-[11px] font-mono text-neutral-400 uppercase">{ui.drawdownFromPeak}</span>
          <div
            className={`text-2xl font-extrabold font-mono tabular-nums my-1 ${
              stats.currentDrawdownPct > stopLossLimitPct
                ? 'text-rose-400'
                : 'text-emerald-300'
            }`}
          >
            -{stats.currentDrawdownPct.toFixed(1)}%
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500">
            <span>{ui.highWaterMark}:</span>
            <span className="text-white">
              {currency}
              {stats.peakEquity.toFixed(0)}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Dynamic Main Workspace by Active Tab */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 8 Cols: Dual-Line Actual P&L vs Expected +EV Area Chart + Streak Strip */}
          <div className="lg:col-span-8 rounded-2xl border border-neutral-800 bg-[#0b1119]/90 p-5 sm:p-6 flex flex-col justify-between space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">{ui.equityCurveTitle}</h3>
                <p className="text-xs text-neutral-400 mt-0.5">{ui.equityCurveSub}</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                <span className="flex items-center gap-1.5 text-[#43f08a]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#43f08a]" />
                  {ui.actualPnlLabel}
                </span>
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <span className="w-3 h-0.5 bg-cyan-400" />
                  {ui.expectedEvLabel}
                </span>
              </div>
            </div>

            {/* Interactive SVG Dual-Curve Chart */}
            <div className="w-full bg-[#070b11] rounded-xl border border-neutral-800/80 p-3">
              <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-52 overflow-visible">
                <defs>
                  <linearGradient id="bankrollActualGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#43f08a" stopOpacity="0.32" />
                    <stop offset="100%" stopColor="#43f08a" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid Lines */}
                {[0.2, 0.5, 0.8].map((ratio, idx) => (
                  <line
                    key={idx}
                    x1={padX}
                    y1={padY + ratio * (svgH - padY * 2)}
                    x2={svgW - padX}
                    y2={padY + ratio * (svgH - padY * 2)}
                    stroke="#1e293b"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                ))}

                {/* Zero Baseline */}
                <line
                  x1={padX}
                  y1={zeroY}
                  x2={svgW - padX}
                  y2={zeroY}
                  stroke="#475569"
                  strokeDasharray="4 4"
                  strokeWidth="1.2"
                />
                <text x={6} y={zeroY + 4} fill="#64748b" fontSize="10" fontFamily="monospace">
                  {currency}0
                </text>

                {/* Area Fill under Actual P&L */}
                <path d={actualArea} fill="url(#bankrollActualGrad)" />

                {/* Expected +EV Line (Cyan Dashed) */}
                <path
                  d={expectedPath}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                />

                {/* Actual P&L Curve (Neon Green) */}
                <path
                  d={actualPath}
                  fill="none"
                  stroke="#43f08a"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data Nodes */}
                {stats.trajectory.map((pt, i) => (
                  <g key={i}>
                    <circle
                      cx={toX(i)}
                      cy={toY(pt.actualPnl)}
                      r={i === stats.trajectory.length - 1 ? 5 : 3.2}
                      fill="#070b11"
                      stroke="#43f08a"
                      strokeWidth="2.2"
                    />
                    {i === stats.trajectory.length - 1 && (
                      <text
                        x={toX(i) - 8}
                        y={toY(pt.actualPnl) - 10}
                        textAnchor="end"
                        fill="#43f08a"
                        fontSize="11"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {pt.actualPnl >= 0 ? `+${currency}${pt.actualPnl}` : `${currency}${pt.actualPnl}`}
                      </text>
                    )}
                  </g>
                ))}
              </svg>
            </div>

            {/* Form & Streak Visual Capsule Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-neutral-800/80">
              <span className="text-xs font-mono text-neutral-400 uppercase">{ui.streakStripTitle}</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {bets.slice(0, 12).map((b) => (
                  <span
                    key={b.id}
                    title={`${b.match} (${b.selection} @${b.odds})`}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-extrabold border ${
                      b.status === 'WON'
                        ? 'bg-[#43f08a]/15 border-[#43f08a]/50 text-[#43f08a]'
                        : b.status === 'LOST'
                        ? 'bg-rose-500/15 border-rose-500/50 text-rose-400'
                        : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                    }`}
                  >
                    {b.status === 'WON' ? 'W' : b.status === 'LOST' ? 'L' : 'P'}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right 4 Cols: Bankroll Health Speedometer + Monthly Goal Ring + Stop-Loss Shield */}
          <div className="lg:col-span-4 rounded-2xl border border-neutral-800 bg-[#0b1119]/90 p-5 sm:p-6 flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase font-mono">
                  {ui.bankrollHealthTitle}
                </h3>
                <span className="px-2 py-0.5 rounded bg-[#43f08a]/15 text-[#43f08a] font-mono text-xs font-bold">
                  {stats.healthScore} / 100
                </span>
              </div>

              {/* Speedometer Dial SVG */}
              <div className="flex flex-col items-center my-3">
                <svg viewBox="0 0 220 125" className="w-52 h-32">
                  {/* Background Arc */}
                  <path
                    d="M 25 105 A 85 85 0 0 1 195 105"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="14"
                    strokeLinecap="round"
                  />
                  {/* Danger Zone (Red) */}
                  <path
                    d="M 25 105 A 85 85 0 0 1 70 30"
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="14"
                    strokeLinecap="round"
                  />
                  {/* Neutral Zone (Amber) */}
                  <path
                    d="M 75 28 A 85 85 0 0 1 145 28"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="14"
                  />
                  {/* Prime Quant Zone (Emerald) */}
                  <path
                    d="M 150 30 A 85 85 0 0 1 195 105"
                    fill="none"
                    stroke="#43f08a"
                    strokeWidth="14"
                    strokeLinecap="round"
                  />
                  {/* Needle */}
                  <g transform={`translate(110, 105) rotate(${healthAngle})`}>
                    <polygon points="-3,0 0,-74 3,0" fill="#ffffff" />
                    <circle cx="0" cy="0" r="7" fill="#43f08a" stroke="#070b11" strokeWidth="2.5" />
                  </g>
                  <text
                    x="110"
                    y="92"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="20"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {stats.healthScore}
                  </text>
                </svg>
              </div>
            </div>

            {/* Monthly Goal Progress Bar */}
            <div className="p-3.5 rounded-xl bg-[#070b11] border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-400">{ui.monthlyGoalTitle}</span>
                <span className="text-[#43f08a] font-bold">
                  {currency}
                  {Math.max(0, stats.totalPnL).toFixed(0)} / {currency}
                  {monthlyGoal} ({monthlyProgressPct.toFixed(0)}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-[#43f08a] transition-all"
                  style={{ width: `${monthlyProgressPct}%` }}
                />
              </div>
            </div>

            {/* Stop-Loss Shield Indicator */}
            <div className="p-3.5 rounded-xl bg-[#070b11] border border-neutral-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-mono text-neutral-400">{ui.stopLossShieldTitle}</div>
                <div className="text-xs font-mono text-neutral-300 mt-0.5">
                  Max Drawdown Limit: <strong className="text-white">-{stopLossLimitPct}%</strong>
                </div>
              </div>
              <span
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                  stats.currentDrawdownPct < stopLossLimitPct
                    ? 'bg-[#43f08a]/15 text-[#43f08a] border border-[#43f08a]/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                }`}
              >
                {stats.currentDrawdownPct < stopLossLimitPct ? 'SHIELD ACTIVE' : 'LIMIT BREACHED'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 1-Click Automated +EV Feed (Zero-Typing Automation) */}
      {activeSubTab === 'autofeed' && (
        <div className="rounded-2xl border border-neutral-800 bg-[#0b1119]/95 p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
            <div>
              <h3 className="text-lg font-extrabold text-white">{ui.autoFeedHeader}</h3>
              <p className="text-xs text-neutral-400 mt-1">{ui.autoFeedDesc}</p>
            </div>

            {/* Automated Staking Rule Selector */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-neutral-400">{ui.stakingRuleLabel}</span>
              <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs font-mono">
                <button
                  onClick={() => setStakingRule('quarter_kelly')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    stakingRule === 'quarter_kelly'
                      ? 'bg-[#43f08a] text-neutral-950 font-bold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  0.25x Kelly
                </button>
                <button
                  onClick={() => setStakingRule('half_kelly')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    stakingRule === 'half_kelly'
                      ? 'bg-[#43f08a] text-neutral-950 font-bold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  0.50x Kelly
                </button>
                <button
                  onClick={() => setStakingRule('flat_2pct')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    stakingRule === 'flat_2pct'
                      ? 'bg-[#43f08a] text-neutral-950 font-bold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  2.0% Flat
                </button>
              </div>

              <button
                onClick={handleAutoLogAllEv}
                className="px-4 py-2 rounded-xl bg-[#43f08a] text-neutral-950 font-mono text-xs font-extrabold hover:bg-emerald-300 transition-all shadow-lg shadow-[#43f08a]/20"
              >
                {ui.logAllEvBtn}
              </button>
            </div>
          </div>

          {/* Grid of 1-Click Automated Match Signals */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {autoEvOpportunities.map((opp) => (
              <div
                key={opp.id}
                className="p-4 rounded-xl border border-neutral-800 bg-[#070b11] hover:border-neutral-700 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 mb-1">
                    <span>{opp.league}</span>
                    <span className="px-2 py-0.5 rounded bg-[#43f08a]/15 text-[#43f08a] font-bold">
                      +{opp.evPercent}% EV
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white">{opp.matchTitle}</div>
                  <div className="mt-2 flex items-center justify-between text-xs font-mono bg-neutral-900/90 px-3 py-2 rounded-lg border border-neutral-800">
                    <div>
                      <span className="text-neutral-400 block text-[10px]">{opp.market}</span>
                      <span className="text-[#43f08a] font-bold">{opp.selection}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-white font-bold">@{opp.odds.toFixed(2)}</span>
                      <span className="block text-[10px] text-neutral-400">
                        Fair {(opp.fairProb * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80">
                  <div className="text-xs font-mono">
                    <span className="text-neutral-400 block text-[10px]">Auto-Stake:</span>
                    <span className="text-white font-extrabold">
                      {currency}
                      {opp.recommendedStake.toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() => handleAutoLogSingle(opp)}
                    disabled={opp.isAlreadyLogged}
                    className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
                      opp.isAlreadyLogged
                        ? 'bg-neutral-900 text-neutral-500 border border-neutral-800 cursor-default'
                        : 'bg-[#43f08a] text-neutral-950 hover:bg-emerald-300 shadow-md shadow-[#43f08a]/15'
                    }`}
                  >
                    {opp.isAlreadyLogged ? ui.alreadyLogged : ui.autoPickBtn}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Deep Market & Odds Sweet-Spot Analytics */}
      {activeSubTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance by Market */}
          <div className="rounded-2xl border border-neutral-800 bg-[#0b1119]/90 p-6 space-y-5">
            <h3 className="text-base font-bold text-white">{ui.marketBreakdownTitle}</h3>
            <div className="space-y-4">
              {marketBreakdown.map((m) => (
                <div
                  key={m.name}
                  className="p-4 rounded-xl bg-[#070b11] border border-neutral-800 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-white font-bold">{m.name}</span>
                    <span className={m.pnl >= 0 ? 'text-[#43f08a] font-bold' : 'text-rose-400 font-bold'}>
                      {m.pnl >= 0 ? `+${currency}${m.pnl.toFixed(2)}` : `-${currency}${Math.abs(m.pnl).toFixed(2)}`}{' '}
                      (ROI {m.roi >= 0 ? `+${m.roi.toFixed(1)}%` : `${m.roi.toFixed(1)}%`})
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-neutral-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${m.pnl >= 0 ? 'bg-[#43f08a]' : 'bg-rose-500'}`}
                      style={{ width: `${Math.min(100, Math.max(15, m.winRate))}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                    <span>Wagers: {m.count}</span>
                    <span>Win Rate: {m.winRate.toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Odds Sweet-Spot Visual Towers */}
          <div className="rounded-2xl border border-neutral-800 bg-[#0b1119]/90 p-6 space-y-5 flex flex-col justify-between">
            <h3 className="text-base font-bold text-white">{ui.oddsSweetSpotTitle}</h3>

            <div className="grid grid-cols-3 gap-4 items-end pt-6 px-2 h-56 bg-[#070b11] rounded-xl border border-neutral-800 p-4">
              {oddsBrackets.map((br) => {
                const heightPct = Math.min(100, Math.max(22, Math.abs(br.pnl) / 2.5 + 30));
                return (
                  <div key={br.label} className="flex flex-col items-center h-full justify-end space-y-2">
                    <span
                      className={`text-xs font-mono font-bold ${
                        br.pnl >= 0 ? 'text-[#43f08a]' : 'text-rose-400'
                      }`}
                    >
                      {br.pnl >= 0 ? `+${currency}${br.pnl.toFixed(0)}` : `-${currency}${Math.abs(br.pnl).toFixed(0)}`}
                    </span>
                    <div
                      className={`w-full max-w-[72px] rounded-t-xl border transition-all ${
                        br.pnl >= 0
                          ? 'bg-gradient-to-t from-emerald-500/20 to-[#43f08a]/60 border-[#43f08a]'
                          : 'bg-gradient-to-t from-rose-500/20 to-rose-500/50 border-rose-500'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className="text-[11px] font-mono text-neutral-300 text-center leading-tight">
                      {br.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Bankroll Vault, Deposits/Withdrawals & Risk Shield */}
      {activeSubTab === 'vault' && (
        <div className="rounded-2xl border border-neutral-800 bg-[#0b1119]/90 p-6 space-y-6">
          <div>
            <h3 className="text-lg font-extrabold text-white">{ui.vaultTitle}</h3>
            <p className="text-xs text-neutral-400 mt-1">{ui.vaultDesc}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Starting Bankroll & Monthly Target */}
            <div className="p-4 rounded-xl bg-[#070b11] border border-neutral-800 space-y-3 text-xs font-mono">
              <div>
                <label className="block text-neutral-400 mb-1">
                  {ui.startingCapital} ({currency})
                </label>
                <input
                  type="number"
                  value={startingBankroll}
                  onChange={(e) => setStartingBankroll(Math.max(50, parseFloat(e.target.value) || 0))}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white font-bold"
                />
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">
                  {ui.monthlyGoalInput} ({currency})
                </label>
                <input
                  type="number"
                  value={monthlyGoal}
                  onChange={(e) => setMonthlyGoal(Math.max(10, parseFloat(e.target.value) || 0))}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white font-bold"
                />
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">{ui.stopLossInput}</label>
                <input
                  type="number"
                  min={5}
                  max={50}
                  value={stopLossLimitPct}
                  onChange={(e) => setStopLossLimitPct(Math.max(5, parseFloat(e.target.value) || 15))}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white font-bold"
                />
              </div>
            </div>

            {/* Deposit / Withdraw Action Box */}
            <div className="p-4 rounded-xl bg-[#070b11] border border-neutral-800 space-y-4 text-xs font-mono flex flex-col justify-between">
              <div>
                <label className="block text-neutral-400 mb-1">
                  {ui.amountLabel} ({currency})
                </label>
                <input
                  type="number"
                  min={10}
                  step={10}
                  value={vaultAmount}
                  onChange={(e) => setVaultAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2.5 text-lg text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleVaultTransaction('DEPOSIT')}
                  className="py-2.5 px-3 rounded-lg bg-[#43f08a] text-neutral-950 font-extrabold hover:bg-emerald-300 transition-colors"
                >
                  {ui.depositBtn}
                </button>
                <button
                  onClick={() => handleVaultTransaction('WITHDRAW')}
                  className="py-2.5 px-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white font-bold hover:border-rose-400 transition-colors"
                >
                  {ui.withdrawBtn}
                </button>
              </div>
            </div>

            {/* Recent Vault Movements */}
            <div className="p-4 rounded-xl bg-[#070b11] border border-neutral-800 space-y-2 text-xs font-mono">
              <div className="text-neutral-400 uppercase font-bold">Vault History</div>
              {transactions.length === 0 ? (
                <div className="text-neutral-500 py-8 text-center">No deposits/withdrawals yet.</div>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between py-1.5 px-2.5 rounded bg-neutral-900/80 border border-neutral-800"
                    >
                      <span className="text-neutral-400">{tx.date}</span>
                      <span
                        className={
                          tx.type === 'DEPOSIT' ? 'text-[#43f08a] font-bold' : 'text-amber-300 font-bold'
                        }
                      >
                        {tx.type === 'DEPOSIT' ? '+' : '-'}
                        {currency}
                        {tx.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. Interactive Bet Audit Ledger Table */}
      <div className="rounded-2xl border border-neutral-800 bg-[#0b1119]/90 p-5 sm:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h3 className="text-sm sm:text-base font-extrabold text-white font-mono uppercase">
            {ui.ledgerTitle} ({filteredBets.length})
          </h3>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <input
              type="text"
              placeholder={ui.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono text-white focus:border-[#43f08a] focus:outline-none"
            />

            {/* Status Filter Buttons */}
            <div className="flex items-center gap-1 p-1 bg-neutral-950 border border-neutral-800 rounded-lg text-xs font-mono">
              {(
                [
                  { id: 'ALL', label: ui.filterAll },
                  { id: 'WON', label: ui.filterWon },
                  { id: 'LOST', label: ui.filterLost },
                  { id: 'PENDING', label: ui.filterPending },
                ] as const
              ).map((st) => (
                <button
                  key={st.id}
                  onClick={() => setFilter(st.id)}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    filter === st.id
                      ? 'bg-[#43f08a] text-neutral-950 font-extrabold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 bg-neutral-950/60">
                <th className="py-3 px-3">{ui.colDate}</th>
                <th className="py-3 px-3">{ui.colMatch}</th>
                <th className="py-3 px-3">{ui.colMarket}</th>
                <th className="py-3 px-3">{ui.colSelection}</th>
                <th className="py-3 px-3 text-right">{ui.colOdds}</th>
                <th className="py-3 px-3 text-right">{ui.colStake}</th>
                <th className="py-3 px-3 text-right">{ui.colEv}</th>
                <th className="py-3 px-3 text-center">{ui.colStatus}</th>
                <th className="py-3 px-3 text-right">{ui.colPnl}</th>
                <th className="py-3 px-3 text-right">{ui.colActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {filteredBets.map((bet) => {
                const stakePct =
                  stats.currentBankroll > 0 ? (bet.stake / stats.currentBankroll) * 100 : 0;
                return (
                  <tr key={bet.id} className="hover:bg-neutral-900/50 transition-colors">
                    <td className="py-3 px-3 text-neutral-400 whitespace-nowrap">{bet.date}</td>
                    <td className="py-3 px-3 text-white font-bold whitespace-nowrap">{bet.match}</td>
                    <td className="py-3 px-3 text-neutral-300 whitespace-nowrap">{bet.market}</td>
                    <td className="py-3 px-3 text-[#43f08a] font-semibold whitespace-nowrap">
                      {bet.selection}
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums text-white font-bold">
                      @{bet.odds.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums text-neutral-200 whitespace-nowrap">
                      {currency}
                      {bet.stake.toFixed(2)}{' '}
                      <span className="text-[10px] text-neutral-500">({stakePct.toFixed(1)}%)</span>
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums text-cyan-400 font-bold">
                      +{bet.evPercent}%
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <select
                        aria-label="Bet status"
                        value={bet.status}
                        onChange={(e) =>
                          handleStatusChange(bet.id, e.target.value as BetRecord['status'])
                        }
                        className={`text-xs px-2.5 py-1 rounded-lg bg-neutral-950 border focus:outline-none cursor-pointer font-bold ${
                          bet.status === 'WON' || bet.status === 'CASHOUT'
                            ? 'border-[#43f08a] text-[#43f08a]'
                            : bet.status === 'LOST'
                            ? 'border-rose-500 text-rose-400'
                            : 'border-amber-500/60 text-amber-300'
                        }`}
                      >
                        <option value="WON">WON</option>
                        <option value="LOST">LOST</option>
                        <option value="PENDING">PENDING</option>
                        <option value="CASHOUT">CASHOUT</option>
                      </select>
                    </td>
                    <td
                      className={`py-3 px-3 text-right font-extrabold tabular-nums whitespace-nowrap ${
                        bet.pnl > 0
                          ? 'text-[#43f08a]'
                          : bet.pnl < 0
                          ? 'text-rose-400'
                          : 'text-neutral-400'
                      }`}
                    >
                      {bet.pnl > 0
                        ? `+${currency}${bet.pnl.toFixed(2)}`
                        : bet.pnl < 0
                        ? `-${currency}${Math.abs(bet.pnl).toFixed(2)}`
                        : `${currency}0.00`}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {bet.status === 'PENDING' && (
                          <button
                            onClick={() => handleStatusChange(bet.id, 'CASHOUT')}
                            className="px-2 py-1 rounded bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 text-[10px]"
                          >
                            {ui.cashoutBtn}
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteBet(bet.id)}
                          className="px-2 py-1 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-rose-400 hover:border-rose-500/40 text-[10px]"
                          title={ui.deleteBtn}
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Smart Auto-Fill Add Bet Modal (Zero Manual Typing) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-[#090e16] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-extrabold text-white font-mono">{ui.smartAddTitle}</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddBetSubmit} className="space-y-4 text-xs font-mono">
              {/* Live Fixture Selector Dropdown */}
              <div className="p-3.5 rounded-xl bg-[#0c1622] border border-cyan-500/30 space-y-2.5">
                <label className="block text-cyan-300 font-bold">{ui.selectLiveFixtureLabel}</label>
                <select
                  value={selectedFixtureId}
                  onChange={(e) => handleSelectFixtureInModal(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:border-[#43f08a] focus:outline-none"
                >
                  <option value="">{ui.chooseFixturePlaceholder}</option>
                  {matches.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.league}: {m.homeTeam} vs {m.awayTeam} (@{m.bookmakerOdds.home.toFixed(2)})
                    </option>
                  ))}
                </select>

                {/* 1-Click Market Preset Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => handleQuickMarketPreset('HOME')}
                    className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-700 hover:border-[#43f08a] text-neutral-200"
                  >
                    1 (Home)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickMarketPreset('DRAW')}
                    className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-700 hover:border-[#43f08a] text-neutral-200"
                  >
                    X (Draw)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickMarketPreset('AWAY')}
                    className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-700 hover:border-[#43f08a] text-neutral-200"
                  >
                    2 (Away)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickMarketPreset('OVER25')}
                    className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-700 hover:border-[#43f08a] text-[#43f08a]"
                  >
                    Over 2.5
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickMarketPreset('BTTS')}
                    className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-700 hover:border-[#43f08a] text-cyan-300"
                  >
                    BTTS Yes
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">{ui.orCustomMatchLabel}</label>
                  <input
                    type="text"
                    required
                    value={newMatch}
                    onChange={(e) => setNewMatch(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">{ui.leagueLabel}</label>
                  <input
                    type="text"
                    value={newLeague}
                    onChange={(e) => setNewLeague(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">{ui.marketLabel}</label>
                  <input
                    type="text"
                    value={newMarket}
                    onChange={(e) => setNewMarket(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">{ui.selectionLabel}</label>
                  <input
                    type="text"
                    required
                    value={newSelection}
                    onChange={(e) => setNewSelection(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-[#43f08a] font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">{ui.oddsLabel}</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1.01"
                    required
                    value={newOdds}
                    onChange={(e) => setNewOdds(parseFloat(e.target.value) || 1.5)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white font-bold"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-neutral-400">
                      {ui.stakeLabel} ({currency})
                    </label>
                    <button
                      type="button"
                      onClick={() => setNewStake(computeAutoStake(newOdds, newFairProb))}
                      className="text-[10px] text-[#43f08a] hover:underline"
                    >
                      ⚡ {ui.autoKellyBtn}
                    </button>
                  </div>
                  <input
                    type="number"
                    step="5"
                    min="1"
                    required
                    value={newStake}
                    onChange={(e) => setNewStake(parseFloat(e.target.value) || 10)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white font-bold"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-neutral-400 hover:text-white"
                >
                  {ui.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#43f08a] text-neutral-950 font-extrabold rounded-lg hover:bg-emerald-300 transition-colors"
                >
                  {ui.saveBetBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Smart Bet Slip Parser (Paste Multiple Bets) */}
      {showSmartPasteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-[#090e16] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-extrabold text-white font-mono">{ui.smartPasteTitle}</h3>
              <button
                onClick={() => setShowSmartPasteModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">{ui.smartPasteDesc}</p>

            <textarea
              rows={5}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={ui.smartPastePlaceholder}
              className="w-full rounded-xl bg-neutral-950 border border-neutral-800 p-3 text-xs font-mono text-[#43f08a] focus:border-[#43f08a] focus:outline-none"
            />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowSmartPasteModal(false)}
                className="px-4 py-2 text-xs font-mono text-neutral-400 hover:text-white"
              >
                {ui.cancelBtn}
              </button>
              <button
                type="button"
                onClick={handleParseAndImport}
                className="px-5 py-2 rounded-lg bg-[#43f08a] text-neutral-950 font-mono text-xs font-extrabold hover:bg-emerald-300 transition-colors"
              >
                {ui.parseAndImportBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
