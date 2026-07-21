(function () {
  const config = window.TOPS_PROFILE_CONFIG || {};
  const players = window[config.dataKey] || [];
  const id = new URLSearchParams(window.location.search).get("id") || players[0]?.id;
  const player = players.find((item) => item.id === id);
  const detail = document.querySelector("#player-profile");
  const notFound = document.querySelector("#player-not-found");

  const euro = (value) => String(value ?? "").replace(/EUR/g, "&euro;").replace(/\$/g, "&euro;");
  const number = (value) => Number(value ?? 0);
  const initials = (name) => String(name || "TOPS").replace(/\([^)]*\)/g, "").split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const position = (item) => item.specificPosition || item.position || "--";
  const statFourth = (item) => item.positionShort === "GKP" || position(item).includes("GK") ? "Clean Sheets" : "Clearances";
  const statFourthKey = (item) => statFourth(item) === "Clean Sheets" ? "cleanSheets" : "clearances";
  const birthDate = (item) => item.birthDate || item.dateOfBirth || item.dob || "";
  const displayClubName = (name) => String(name || "").replace(/\s+F\.?C\.?$/i, "").trim();
  const clubLogos = {
    "arsenal": "assets/club-arsenal.webp",
    "as roma": "assets/club-as-roma.svg",
    "athletic bilbao": "assets/club-athletic-bilbao.svg",
    "aston villa": "assets/club-aston-villa.webp",
    "barcelona": "assets/club-barcelona.svg",
    "bournemouth": "assets/club-bournemouth.webp",
    "brentford": "assets/club-brentford.webp",
    "brighton": "assets/club-brighton.webp",
    "chelsea": "assets/club-chelsea.webp",
    "como": "assets/club-como.svg",
    "crystal palace": "assets/club-crystal-palace.webp",
    "everton": "assets/club-everton.webp",
    "fiorentina": "assets/club-fiorentina.svg",
    "fulham": "assets/club-fulham.webp",
    "leeds": "assets/club-leeds.webp",
    "liverpool": "assets/club-liverpool.webp",
    "inter": "assets/club-inter-milan.svg",
    "inter milan": "assets/club-inter-milan.svg",
    "man city": "assets/club-manchester-city.webp",
    "manchester city": "assets/club-manchester-city.webp",
    "manchester united": "assets/club-manchester-united.webp",
    "napoli": "assets/club-napoli.svg",
    "newcastle": "assets/club-newcastle.webp",
    "nottingham forest": "assets/club-nottingham-forest.webp",
    "paris saint-germain": "assets/club-psg.svg",
    "paris saint germain": "assets/club-psg.svg",
    "psg": "assets/club-psg.svg",
    "real madrid": "assets/club-real-madrid.svg",
    "spurs": "assets/club-tottenham-hotspur.webp",
    "sunderland": "assets/club-sunderland.webp",
    "tottenham": "assets/club-tottenham-hotspur.webp",
    "tottenham hotspur": "assets/club-tottenham-hotspur.webp",
    "vfb stuttgart": "assets/club-vfb-stuttgart.svg",
    "west ham": "assets/club-west-ham.webp",
    "wolves": "assets/club-wolves.webp"
  };
  function transferRecordsFor(item) {
    const windows = window.TOPS_TRANSFER_DATA?.windows || [];
    return windows.flatMap((windowItem) => [
      ...(windowItem.arrivals || []).filter((entry) => entry.playerId === item.id).map((entry) => ({
        kind: "Arrival",
        season: windowItem.season,
        from: entry.from,
        to: "ISLINGTON",
        fee: entry.fee,
        weeklyWage: entry.weeklyWage,
        detail: entry.contract || ""
      })),
      ...(windowItem.academyPromotions || []).filter((entry) => entry.playerId === item.id).map((entry) => ({
        kind: "Academy",
        season: windowItem.season,
        from: entry.from,
        to: "ISLINGTON",
        fee: entry.fee,
        weeklyWage: entry.weeklyWage,
        detail: entry.contract || entry.note || ""
      })),
      ...(windowItem.departures || []).filter((entry) => entry.playerId === item.id).map((entry) => ({
        kind: "Departure",
        season: windowItem.season,
        from: "ISLINGTON",
        to: entry.destination,
        fee: entry.fee,
        weeklyWage: "",
        detail: ""
      })),
      ...(windowItem.loansOut || []).filter((entry) => entry.playerId === item.id).map((entry) => ({
        kind: "Loan Out",
        season: windowItem.season,
        from: "ISLINGTON",
        to: entry.destination,
        fee: entry.type || "Loan",
        weeklyWage: "",
        detail: entry.type || "Loan"
      }))
    ]);
  }

  function clubToken(name) {
    const normalized = String(name || "").toLowerCase().replace(/\s*\([^)]*\)/g, "").replace(/\bf\.?c\.?\b/g, "").replace(/\s+/g, " ").trim();
    const isIslington = normalized.includes("islington");
    const logo = isIslington ? "assets/islington-official-crest.webp" : clubLogos[normalized];
    const displayName = displayClubName(name);
    return `<div class="club-token"><span class="club-logo">${logo ? `<img src="${logo}" alt="">` : initials(displayName)}</span><span>${displayName}</span></div>`;
  }

  function renderTransfer(record) {
    return `
      <article class="transfer-card">
        <div class="transfer-layout">
          <div class="transfer-kind"><b>${record.season}</b>${record.kind}</div>
          ${clubToken(record.from)}
          <div class="transfer-arrow">&rarr;</div>
          ${clubToken(record.to)}
          <div class="transfer-money">
            <span class="money-label">Transfer Fee</span><span class="money-value">${euro(record.fee)}</span>
            ${record.weeklyWage ? `<span class="money-label">Weekly Wage</span><span class="money-value">${euro(record.weeklyWage)}</span>` : ""}
          </div>
        </div>
      </article>
    `;
  }

  function renderTransferSection(records) {
    if (!records.length) {
      return `
        <section class="transfer-section panel">
          <p class="panel-title" title="Transfer History">Moves</p>
          <div class="transfer-empty">No records yet.</div>
          <a class="transfer-full-link" href="transfer-history.html">Full history &rsaquo;</a>
        </section>
      `;
    }
    return `
      <section class="transfer-section panel">
        <p class="panel-title" title="Transfer History">Moves</p>
        <div class="transfer-stack">${records.map(renderTransfer).join("")}</div>
        <a class="transfer-full-link" href="transfer-history.html">Full history &rsaquo;</a>
      </section>
    `;
  }

  if (!player) {
    notFound.hidden = false;
    return;
  }

  document.title = `${player.name} | TOPS`;
  detail.hidden = false;

  const seasons = player.seasonStats || [{ season: player.seasons || "2026/27", ...(player.stats || {}) }];
  const fourthKey = statFourthKey(player);
  const totals = seasons.reduce((sum, item) => ({
    appearances: sum.appearances + number(item.appearances),
    goals: sum.goals + number(item.goals),
    assists: sum.assists + number(item.assists),
    fourth: sum.fourth + number(item[fourthKey] ?? item.cleanSheets ?? 0)
  }), { appearances: 0, goals: 0, assists: 0, fourth: 0 });
  const transfers = transferRecordsFor(player);
  const playerAge = config.isArchive ? "" : (player.age || "");
  const titleFacts = [
    player.nationality ? `<span class="title-fact">${player.flag ? `<img src="${player.flag}" alt="">` : ""}<b>${player.nationality}</b></span>` : "",
    position(player) ? `<span class="title-fact"><b>${position(player)}</b></span>` : "",
    playerAge ? `<span class="title-fact title-age"><b>${playerAge}</b>${birthDate(player) ? `<small>${birthDate(player)}</small>` : ""}</span>` : ""
  ].filter(Boolean).join("");

  detail.innerHTML = `
    <a class="back-link" href="${config.backHref}">${config.backLabel}</a>
    <header class="profile-head">
      <span class="profile-number">${player.number || ""}</span>
      <h1 class="profile-name">${player.name}</h1>
      ${titleFacts ? `<div class="title-facts">${titleFacts}</div>` : ""}
    </header>
    <div class="profile-grid">
      <div>
        <figure class="portrait-card" data-number="${player.number || ""}">${player.photo ? `<img src="${player.photo}" alt="${player.name}">` : ""}</figure>
      </div>
      <div class="content-panel">
        <section class="career-card panel">
          <p class="panel-title" title="${config.statsTitle || "Career Stats"}">Stats</p>
          <div class="career-stats">
            <div class="career-stat"><div><div class="stat-value">${totals.appearances}</div><div class="stat-label">Appearances</div></div></div>
            <div class="career-stat"><div><div class="stat-value">${totals.goals}</div><div class="stat-label">Goals</div></div></div>
            <div class="career-stat"><div><div class="stat-value">${totals.assists}</div><div class="stat-label">Assists</div></div></div>
            <div class="career-stat"><div><div class="stat-value">${totals.fourth}</div><div class="stat-label">${statFourth(player)}</div></div></div>
          </div>
        </section>
        <section class="season-block panel">
          <p class="panel-title" title="Season Statistics">Seasons</p>
          <div class="season-scroll">
            <table class="season-table">
              <thead><tr><th>Season</th><th>Apps</th><th>Goals</th><th>Assists</th><th>${statFourth(player)}</th><th>Avg Rating</th></tr></thead>
              <tbody>
                ${seasons.map((item) => `
                  <tr>
                    <td><div class="season-cell"><span>${item.season}</span>${item.loanClub ? `<span class="loan-chip"><b>Loan</b><span>${item.loanLogo ? `<img src="${item.loanLogo}" alt="">` : ""}${item.loanClub}</span></span>` : ""}</div></td>
                    <td>${item.appearances ?? 0}</td><td>${item.goals ?? 0}</td><td>${item.assists ?? 0}</td><td>${item[fourthKey] ?? item.cleanSheets ?? 0}</td><td>${item.averageRating ?? "0.0"}</td>
                  </tr>`).join("")}
              </tbody>
            </table>
          </div>
        </section>
        ${renderTransferSection(transfers)}
      </div>
    </div>
  `;
})();
