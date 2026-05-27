import {
  selectInningsScorecard,
  selectMatchResult,
} from "@/stores/selectors/scorecardSelectors";

// Helper to build over‑by‑over timeline from ballLog
const buildTimeline = (balls: any[]) => {
  const oversMap: Record<number, any[]> = {};
  balls.forEach((ball) => {
    const over = ball.overNumber;
    if (!oversMap[over]) oversMap[over] = [];
    oversMap[over].push(ball);
  });
  return Object.entries(oversMap).map(([overNum, ballsInOver]) => ({
    overNumber: Number(overNum) + 1,
    balls: ballsInOver.map((b) => ({
      displayText: b.result || b.runs.toString(),
      isWicket: b.isWicket === true,
      isBoundary: b.runs === 4 || b.runs === 6,
      isExtra: b.extraType !== null,
      isRetired: b.result === "RH" || b.result === "RO",
    })),
  }));
};

const formatOvers = (balls: number) => {
  const overs = Math.floor(balls / 6);
  const ballsLeft = balls % 6;
  return `${overs}.${ballsLeft}`;
};

const getScorecardHTML = (data: any) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
  <title>${data.matchTitle} | Scorecard</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      background: #eef2f0;
      font-family: 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
      padding: 24px 16px;
      color: #1a2c1e;
    }

    .scorecard-container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 32px;
      box-shadow: 0 20px 35px -12px rgba(0, 0, 0, 0.15);
      overflow: hidden;
      padding: 24px 24px 32px;
      transition: all 0.2s;
    }

    /* Header */
    .match-header {
      text-align: center;
      margin-bottom: 28px;
      padding-bottom: 20px;
      border-bottom: 3px solid #e9f0e6;
    }
    .match-title {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -0.5px;
      background: linear-gradient(135deg, #0f3d0a, #2c6e1f);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      margin-bottom: 6px;
    }
    .match-detail {
      color: #4b5e47;
      font-size: 15px;
      margin-top: 6px;
    }
    .match-detail strong {
      color: #1c4d0e;
    }

    /* Innings heading */
    .innings-card {
      background: #fefef7;
      border-radius: 28px;
      margin-top: 28px;
      margin-bottom: 28px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.03);
    }
    .innings-title {
      background: #eaf4e5;
      padding: 16px 20px;
      border-radius: 28px 28px 0 0;
      font-size: 20px;
      font-weight: 800;
      color: #1c3d13;
      border-left: 8px solid #2e7d32;
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      flex-wrap: wrap;
    }
    .innings-score {
      font-family: monospace;
      font-size: 18px;
      background: #ffffffaa;
      padding: 4px 12px;
      border-radius: 40px;
    }

    /* Tables */
    .score-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 15px;
      margin-top: 0;
    }
    .score-table th {
      background: #f4f8f2;
      padding: 14px 10px;
      text-align: left;
      font-weight: 700;
      color: #2b4b1e;
      border-bottom: 2px solid #ddebd8;
    }
    .score-table td {
      padding: 12px 10px;
      border-bottom: 1px solid #eef3ea;
      vertical-align: middle;
    }
    .text-center {
      text-align: center;
    }
    .text-right {
      text-align: right;
    }
    .font-mono {
      font-family: 'Courier New', monospace;
      font-weight: 600;
    }
    .batsman-name {
      font-weight: 800;
      color: #1a3b12;
    }
    .dismissal-text {
      font-size: 12px;
      color: #7b8a72;
      margin-top: 3px;
      letter-spacing: -0.2px;
    }
    .extra-row {
      background: #fefce8;
      font-weight: 500;
      border-top: 1px solid #e9f0e2;
    }
    .total-row {
      background: #eef3e9;
      font-weight: 800;
      border-top: 2px solid #cbdcc3;
    }
    .bowler-name {
      font-weight: 700;
      color: #2b5e1a;
    }

    /* Extras & fall of wkts */
    .stats-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      margin-top: 24px;
      padding: 8px 6px;
    }
    .extras-box, .fow-box {
      flex: 1;
      background: #f9fbf7;
      border-radius: 24px;
      padding: 16px 20px;
      border: 1px solid #e2ecd9;
    }
    .extras-title, .fow-title {
      font-weight: 800;
      font-size: 16px;
      margin-bottom: 12px;
      color: #2f6b23;
      border-left: 4px solid #2e7d32;
      padding-left: 12px;
    }
    .extras-detail {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
      font-size: 14px;
    }
    .fow-items {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
    .fow-badge {
      background: white;
      border-radius: 40px;
      padding: 5px 14px;
      font-size: 13px;
      border: 1px solid #cfe2c7;
      color: #2c5a1c;
    }

    /* Ball timeline */
    .timeline-card {
      margin-top: 36px;
      background: #ffffff;
      border-radius: 28px;
      border: 1px solid #e2ecd9;
      padding: 20px;
    }
    .timeline-title {
      font-weight: 800;
      font-size: 18px;
      margin-bottom: 20px;
      color: #1a4d10;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .over-group {
      margin-bottom: 24px;
      border-bottom: 1px dashed #e2ecd9;
      padding-bottom: 16px;
    }
    .over-header {
      font-weight: 700;
      font-size: 15px;
      margin-bottom: 12px;
      color: #2d5a24;
      background: #f3f8ef;
      display: inline-block;
      padding: 4px 16px;
      border-radius: 40px;
    }
    .ball-bubbles {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .ball {
      width: 44px;
      height: 44px;
      border-radius: 44px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 17px;
      background: #f1f4ef;
      color: #1b3f12;
      border: 1px solid #cfdec7;
      transition: transform 0.1s ease;
    }
    .ball-wicket {
      background: #d32f2f;
      color: white;
      border: none;
      box-shadow: 0 2px 6px rgba(211,47,47,0.3);
    }
    .ball-boundary {
      background: #2e7d32;
      color: white;
      border: none;
      box-shadow: 0 2px 6px rgba(46,125,50,0.3);
    }
    .ball-extra {
      background: #f57c00;
      color: white;
      border: none;
    }
    .ball-retired {
      background: #6c757d;
      color: white;
    }

    .footer {
      text-align: center;
      font-size: 11px;
      color: #8aa07e;
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px solid #e4ede0;
    }

    @media (max-width: 680px) {
      .scorecard-container {
        padding: 16px;
      }
      .ball {
        width: 38px;
        height: 38px;
        font-size: 14px;
      }
      .score-table th, .score-table td {
        padding: 8px 6px;
        font-size: 13px;
      }
      .innings-title {
        font-size: 16px;
      }
      .match-title {
        font-size: 24px;
      }
    }

    @media print {
      body {
        background: white;
        padding: 0;
      }
      .scorecard-container {
        box-shadow: none;
        padding: 8px;
      }
      .ball {
        border: 1px solid #aaa;
        background: #f9f9f9;
        color: black;
      }
      .ball-wicket, .ball-boundary, .ball-extra {
        background: #eee;
        color: black;
        border: 1px solid #aaa;
      }
    }
  </style>
</head>
<body>
<div class="scorecard-container">
  <!-- HEADER -->
  <div class="match-header">
    <div class="match-title">${data.teamA} vs ${data.teamB}</div>
    <div class="match-detail"><strong>${data.matchDescription}</strong> &nbsp;|&nbsp; Toss: ${data.tossDetails}</div>
    <div class="match-detail">${data.date} &nbsp;|&nbsp; Overs: ${data.maxOvers} per side</div>
    <div class="match-detail"><span style="background:#eef2e6; padding:4px 12px; border-radius:40px;">Result: ${data.result}</span></div>
  </div>

  <!-- INNINGS 1 -->
  ${
    data.innings1
      ? `
  <div class="innings-card">
    <div class="innings-title">
      <span>INNINGS 1 – ${data.innings1.battingTeamName}</span>
      <span class="innings-score">${data.innings1.totalRuns}/${data.innings1.wickets} (${data.innings1.totalOvers} ov)</span>
    </div>
    <table class="score-table">
      <thead><tr><th>BATSMAN</th><th>DISMISSAL</th><th class="text-center">R</th><th class="text-center">B</th><th class="text-center">4s</th><th class="text-center">6s</th><th class="text-center">SR</th></tr></thead>
      <tbody>
        ${data.innings1.batsmen
          .map(
            (b: any) => `
        <tr>
          <td><span class="batsman-name">${b.name}</span>${b.dismissal ? `<div class="dismissal-text">${b.dismissal}</div>` : ""}</td>
          <td>${b.dismissal || "not out"}</td>
          <td class="text-center font-mono">${b.runs}</td>
          <td class="text-center">${b.balls}</td>
          <td class="text-center">${b.fours}</td>
          <td class="text-center">${b.sixes}</td>
          <td class="text-center font-mono">${b.strikeRate}</td>
        </tr>
        `,
          )
          .join("")}
        <tr class="extra-row">
          <td colspan="6" class="text-right"><strong>Extras</strong> (${data.innings1.extras.wides} wides, ${data.innings1.extras.noBalls} no balls, ${data.innings1.extras.byes} byes, ${data.innings1.extras.legByes} leg byes)</td>
          <td class="text-center bold">${data.innings1.extras.wides + data.innings1.extras.noBalls + data.innings1.extras.byes + data.innings1.extras.legByes}</td>
        </tr>
        <tr class="total-row">
          <td colspan="6" class="text-right"><strong>TOTAL</strong> (${data.innings1.wickets} wkts, ${data.innings1.totalOvers} ov)</td>
          <td class="text-center bold">${data.innings1.totalRuns}</td>
        </tr>
      </tbody>
    </table>

    <!-- Bowling -->
    <table class="score-table">
      <thead><tr><th>BOWLER</th><th class="text-center">O</th><th class="text-center">M</th><th class="text-center">R</th><th class="text-center">W</th><th class="text-center">Econ</th></tr></thead>
      <tbody>
        ${data.innings1.bowlers
          .map(
            (b: any) => `
        <tr>
          <td><span class="bowler-name">${b.name}</span></td>
          <td class="text-center">${b.overs}</td>
          <td class="text-center">${b.maidens}</td>
          <td class="text-center">${b.runs}</td>
          <td class="text-center">${b.wickets}</td>
          <td class="text-center">${b.economy}</td>
        </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>

    <!-- Extras + Fall of wickets -->
    <div class="stats-grid">
      <div class="extras-box">
        <div class="extras-title">Extras breakdown</div>
        <div class="extras-detail">
          <span>Wides: ${data.innings1.extras.wides}</span>
          <span>No balls: ${data.innings1.extras.noBalls}</span>
          <span>Byes: ${data.innings1.extras.byes}</span>
          <span>Leg byes: ${data.innings1.extras.legByes}</span>
        </div>
      </div>
      ${
        data.innings1.fallOfWickets && data.innings1.fallOfWickets.length
          ? `
      <div class="fow-box">
        <div class="fow-title">Fall of wickets</div>
        <div class="fow-items">
          ${data.innings1.fallOfWickets.map((f: any) => `<span class="fow-badge">${f.wicketNumber}-${f.runsAt} (${f.batsmanOutName}, ${f.oversAt})</span>`).join("")}
        </div>
      </div>
      `
          : ""
      }
    </div>
  </div>
  `
      : ""
  }

  <!-- INNINGS 2 (if exists) -->
  ${
    data.innings2
      ? `
  <div class="innings-card" style="margin-top: 32px;">
    <div class="innings-title">
      <span>INNINGS 2 – ${data.innings2.battingTeamName}</span>
      <span class="innings-score">${data.innings2.totalRuns}/${data.innings2.wickets} (${data.innings2.totalOvers} ov)</span>
    </div>
    <table class="score-table">
      <thead><tr><th>BATSMAN</th><th>DISMISSAL</th><th class="text-center">R</th><th class="text-center">B</th><th class="text-center">4s</th><th class="text-center">6s</th><th class="text-center">SR</th></tr></thead>
      <tbody>
        ${data.innings2.batsmen
          .map(
            (b: any) => `
        <tr>
          <td><span class="batsman-name">${b.name}</span>${b.dismissal ? `<div class="dismissal-text">${b.dismissal}</div>` : ""}</td>
          <td>${b.dismissal || "not out"}</td>
          <td class="text-center font-mono">${b.runs}</td>
          <td class="text-center">${b.balls}</td>
          <td class="text-center">${b.fours}</td>
          <td class="text-center">${b.sixes}</td>
          <td class="text-center font-mono">${b.strikeRate}</td>
        </tr>
        `,
          )
          .join("")}
        <tr class="extra-row">
          <td colspan="6" class="text-right"><strong>Extras</strong> (${data.innings2.extras.wides} wides, ${data.innings2.extras.noBalls} no balls, ${data.innings2.extras.byes} byes, ${data.innings2.extras.legByes} leg byes)</td>
          <td class="text-center bold">${data.innings2.extras.wides + data.innings2.extras.noBalls + data.innings2.extras.byes + data.innings2.extras.legByes}</td>
        </tr>
        <tr class="total-row">
          <td colspan="6" class="text-right"><strong>TOTAL</strong> (${data.innings2.wickets} wkts, ${data.innings2.totalOvers} ov)</td>
          <td class="text-center bold">${data.innings2.totalRuns}</td>
        </tr>
      </tbody>
    </table>
    <table class="score-table">
      <thead><tr><th>BOWLER</th><th class="text-center">O</th><th class="text-center">M</th><th class="text-center">R</th><th class="text-center">W</th><th class="text-center">Econ</th></tr></thead>
      <tbody>
        ${data.innings2.bowlers
          .map(
            (b: any) => `
        <tr>
          <td><span class="bowler-name">${b.name}</span></td>
          <td class="text-center">${b.overs}</td>
          <td class="text-center">${b.maidens}</td>
          <td class="text-center">${b.runs}</td>
          <td class="text-center">${b.wickets}</td>
          <td class="text-center">${b.economy}</td>
        </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
    <div class="stats-grid">
      <div class="extras-box">
        <div class="extras-title">Extras breakdown</div>
        <div class="extras-detail">
          <span>Wides: ${data.innings2.extras.wides}</span>
          <span>No balls: ${data.innings2.extras.noBalls}</span>
          <span>Byes: ${data.innings2.extras.byes}</span>
          <span>Leg byes: ${data.innings2.extras.legByes}</span>
        </div>
      </div>
      ${
        data.innings2.fallOfWickets && data.innings2.fallOfWickets.length
          ? `
      <div class="fow-box">
        <div class="fow-title">Fall of wickets</div>
        <div class="fow-items">
          ${data.innings2.fallOfWickets.map((f: any) => `<span class="fow-badge">${f.wicketNumber}-${f.runsAt} (${f.batsmanOutName}, ${f.oversAt})</span>`).join("")}
        </div>
      </div>
      `
          : ""
      }
    </div>
  </div>
  `
      : ""
  }

  <!-- Ball timeline (first innings) -->
  ${
    data.oversTimeline && data.oversTimeline.length
      ? `
  <div class="timeline-card">
    <div class="timeline-title">⏱Ball‑by‑ball (Innings 1)</div>
    ${data.oversTimeline
      .map(
        (over: any) => `
      <div class="over-group">
        <div class="over-header">Over ${over.overNumber}</div>
        <div class="ball-bubbles">
          ${over.balls
            .map((ball: any) => {
              let cls = "";
              if (ball.isWicket) cls = "ball-wicket";
              else if (ball.isBoundary) cls = "ball-boundary";
              else if (ball.isExtra) cls = "ball-extra";
              else if (ball.isRetired) cls = "ball-retired";
              else cls = "";
              return `<span class="ball ${cls}">${ball.displayText}</span>`;
            })
            .join("")}
        </div>
      </div>
    `,
      )
      .join("")}
  </div>
  `
      : ""
  }

  <div class="footer">
    Generated by ScoreHive • ${data.timestamp}
  </div>
</div>
</body>
</html>`;
};

export const generateScorecardHTML = (
  state: any,
  tossWinner: string,
  optedTo: string,
) => {
  const innings1 = selectInningsScorecard(state, 1);
  const innings2 = selectInningsScorecard(state, 2);
  const matchResult = selectMatchResult(state);

  // Enhance fall of wickets with batsman name
  const enrichFOW = (innings: any) => {
    if (!innings?.fallOfWickets) return [];
    return innings.fallOfWickets.map((fow: any) => {
      const batsman = innings.batsmen.find(
        (b: any) => b.playerId === fow.batsmanOutId,
      );
      return {
        ...fow,
        batsmanOutName: batsman ? batsman.name : "Unknown",
      };
    });
  };

  return getScorecardHTML({
    matchTitle: `${state.teamA.name} vs ${state.teamB.name}`,
    teamA: state.teamA.name,
    teamB: state.teamB.name,
    matchDescription: `${state.teamA.name} vs ${state.teamB.name}`,
    tossDetails: `${tossWinner} chose to ${optedTo}`,
    result: matchResult || "In progress",
    date: new Date().toISOString().slice(0, 10),
    maxOvers: state.maxOvers,
    innings1: innings1
      ? {
          ...innings1,
          extras: {
            wides: innings1.extras.wides,
            noBalls: innings1.extras.noBalls,
            byes: innings1.extras.byes,
            legByes: innings1.extras.legByes,
          },
          batsmen: innings1.batsmen,
          bowlers: innings1.bowlers.map((b: any) => ({
            ...b,
            overs: formatOvers(b.legalBalls),
          })),
          fallOfWickets: enrichFOW(innings1),
        }
      : null,
    innings2: innings2
      ? {
          ...innings2,
          extras: {
            wides: innings2.extras.wides,
            noBalls: innings2.extras.noBalls,
            byes: innings2.extras.byes,
            legByes: innings2.extras.legByes,
          },
          batsmen: innings2.batsmen,
          bowlers: innings2.bowlers.map((b: any) => ({
            ...b,
            overs: formatOvers(b.legalBalls),
          })),
          fallOfWickets: enrichFOW(innings2),
        }
      : null,
    oversTimeline: innings1?.balls ? buildTimeline(innings1.balls) : [],
    timestamp: new Date().toLocaleString(),
  });
};
