/* Character artwork: Faraz as a Bitmoji-style avatar (quiff, short trimmed beard, mustache, navy blazer),
   sitting behind his laptop at a walnut desk. character.js animates the named parts. */
(() => {
  const almond = (cx, cy) => `M${cx - 25} ${cy + 1}C${cx - 16} ${cy - 15} ${cx + 14} ${cy - 16} ${cx + 25} ${cy - 1}C${cx + 15} ${cy + 12} ${cx - 15} ${cy + 13} ${cx - 25} ${cy + 1}Z`;
  const eye = (cx, cy, id) => `<g id="${id}">
    <clipPath id="${id}C"><path d="${almond(cx, cy)}"/></clipPath>
    <path d="${almond(cx, cy)}" fill="#FBF8F5"/>
    <g clip-path="url(#${id}C)">
      <g class="iris"><circle cx="${cx}" cy="${cy}" r="12.5" fill="#5A3522" stroke="#2A160E" stroke-width="1.6"/><circle cx="${cx}" cy="${cy}" r="6" fill="#120A07"/><circle cx="${cx - 4}" cy="${cy - 4.2}" r="3.2" fill="#fff"/><circle cx="${cx + 3.6}" cy="${cy + 3.6}" r="1.4" fill="#fff" opacity=".8"/></g>
      <rect class="lid" x="${cx - 28}" y="${cy - 18}" width="56" height="33" fill="url(#cSkinU)" transform="matrix(1 0 0 0 0 ${cy - 18})"/>
    </g>
    <path class="lash" d="M${cx - 26} ${cy + 1}C${cx - 16} ${cy - 16.5} ${cx + 14} ${cy - 17.5} ${cx + 26} ${cy - 2}" fill="none" stroke="#17100D" stroke-width="3.8" stroke-linecap="round"/>
    <path d="M${cx - 17} ${cy + 11}C${cx - 6} ${cy + 15} ${cx + 8} ${cy + 14} ${cx + 17} ${cy + 9}" fill="none" stroke="#9C6444" stroke-width="1.6" stroke-linecap="round" opacity=".55"/>
  </g>`;
  const skin = 'fill="#C98E66" stroke="#9C6444" stroke-width="1.5"';
  const hands = `
    <g class="h-fist" ${skin}><rect x="-27" y="-30" width="14" height="24" rx="7"/><rect x="-19" y="-44" width="38" height="46" rx="17"/><path d="M-10 -40v10M0 -42v11M10 -40v10" fill="none" stroke-width="2" opacity=".6"/></g>
    <g class="h-open" display="none" ${skin}><rect x="-19" y="-72" width="9.5" height="34" rx="4.75"/><rect x="-8.5" y="-79" width="9.5" height="40" rx="4.75"/><rect x="2" y="-77" width="9.5" height="38" rx="4.75"/><rect x="12.5" y="-68" width="9" height="30" rx="4.5"/><rect x="-38" y="-34" width="11" height="28" rx="5.5" transform="rotate(-38 -32 -20)"/><rect x="-20" y="-44" width="40" height="46" rx="16"/></g>
    <g class="h-point" display="none" ${skin}><rect x="-5.5" y="-86" width="11" height="48" rx="5.5"/><rect x="-27" y="-30" width="14" height="24" rx="7"/><rect x="-19" y="-44" width="38" height="46" rx="17"/></g>`;
  const arm = id => `<g id="${id}">
    <path class="so" fill="none" stroke="#0E131C" stroke-width="54" stroke-linecap="round" stroke-linejoin="round"/>
    <path class="sl" fill="none" stroke="#222B3E" stroke-width="47" stroke-linecap="round" stroke-linejoin="round"/>
    <path class="cf" fill="none" stroke="#EEF2F7" stroke-width="40"/>
    <g class="hd">${hands}</g>
  </g>`;
  const band = 'M284 276C272 36 528 36 516 276';

  window.FG_ART = `<svg viewBox="0 0 800 800" preserveAspectRatio="xMidYMax meet" aria-hidden="true" focusable="false">
  <defs>
    <radialGradient id="cSkin" cx=".42" cy=".38" r=".75"><stop offset="0" stop-color="#DBA27A"/><stop offset=".6" stop-color="#C98E66"/><stop offset="1" stop-color="#AE7250"/></radialGradient>
    <radialGradient id="cSkinU" gradientUnits="userSpaceOnUse" cx="382.7" cy="249" r="162" gradientTransform="translate(382.7 249) scale(1 1.23) translate(-382.7 -249)"><stop offset="0" stop-color="#DBA27A"/><stop offset=".6" stop-color="#C98E66"/><stop offset="1" stop-color="#AE7250"/></radialGradient>
    <linearGradient id="cNeck" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8E5538"/><stop offset=".45" stop-color="#B27552"/><stop offset="1" stop-color="#BD825E"/></linearGradient>
    <linearGradient id="cBeard" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#40322B"/><stop offset="1" stop-color="#261C18"/></linearGradient>
    <linearGradient id="cHairG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2E231E"/><stop offset="1" stop-color="#130D0B"/></linearGradient>
    <linearGradient id="cBlazer" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#29344E"/><stop offset="1" stop-color="#161C2A"/></linearGradient>
    <linearGradient id="cChair" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1B2334"/><stop offset="1" stop-color="#0F1522"/></linearGradient>
    <linearGradient id="cLid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#465063"/><stop offset="1" stop-color="#262C38"/></linearGradient>
    <linearGradient id="cBase" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BAC2CE"/><stop offset="1" stop-color="#6D7686"/></linearGradient>
    <linearGradient id="cDesk" gradientUnits="userSpaceOnUse" x1="0" y1="742" x2="0" y2="900"><stop offset="0" stop-color="#5A4030"/><stop offset=".1" stop-color="#36261C"/><stop offset="1" stop-color="#18110C"/></linearGradient>
    <radialGradient id="cScreen" cx=".5" cy="1" r=".8"><stop offset="0" stop-color="#BFD6FF" stop-opacity=".3"/><stop offset="1" stop-color="#BFD6FF" stop-opacity="0"/></radialGradient>
    <filter id="cGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="cSoft" x="-20%" y="-100%" width="140%" height="300%"><feGaussianBlur stdDeviation="8"/></filter>
    <clipPath id="cMouthClip"><path id="cMouthClipPath"/></clipPath>
  </defs>

  <g id="cPerson">
    <path d="M236 560L236 380C236 330 272 312 320 308L480 308C528 312 564 330 564 380L564 560Z" fill="url(#cChair)"/>
    <path d="M252 380C252 344 280 328 322 326L478 326C520 328 548 344 548 380" fill="none" stroke="#2C3752" stroke-width="3" stroke-dasharray="7 6"/>
    <path d="M362 360L362 470Q400 490 438 470L438 360Z" fill="url(#cNeck)"/>
    <ellipse cx="400" cy="420" rx="36" ry="12" fill="#6E3F27" opacity=".45"/>
    <path d="M146 800C146 624 176 522 268 488C316 470 352 462 400 462C448 462 484 470 532 488C624 522 654 624 654 800Z" fill="url(#cBlazer)"/>
    <path d="M400 462C448 462 484 470 532 488C580 506 612 540 632 590" fill="none" stroke="#FFCF93" stroke-width="2.5" opacity=".2"/>
    <path d="M350 458L394 620L406 620L450 458Z" fill="#EEF2F7"/>
    <path d="M368 458L400 510L432 458Z" fill="#BD825E"/>
    <path d="M352 452L334 498L386 530L394 512L370 466Z" fill="#F6F8FB" stroke="#C9D2DE" stroke-width="1.2" stroke-linejoin="round"/>
    <path d="M448 452L466 498L414 530L406 512L430 466Z" fill="#F6F8FB" stroke="#C9D2DE" stroke-width="1.2" stroke-linejoin="round"/>
    <path d="M350 462L296 488L316 540L302 548L332 620L386 620Z" fill="#1B2335" stroke="#34405A" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M450 462L504 488L484 540L498 548L468 620L414 620Z" fill="#1B2335" stroke="#34405A" stroke-width="1.5" stroke-linejoin="round"/>
    <circle cx="326" cy="516" r="5" fill="#D6AF69"/><circle cx="324.6" cy="514.6" r="1.6" fill="#FFF3D6"/>

    <g id="cSlotNeck"></g>

    <g id="cHead">
      <g id="cEarL"><ellipse cx="292" cy="284" rx="17" ry="28" fill="#BF845C"/><path d="M297 270C284 274 284 296 296 300" fill="none" stroke="#8E5538" stroke-width="3.5" stroke-linecap="round"/></g>
      <g id="cEarR"><ellipse cx="508" cy="284" rx="17" ry="28" fill="#BF845C"/><path d="M503 270C516 274 516 296 504 300" fill="none" stroke="#8E5538" stroke-width="3.5" stroke-linecap="round"/></g>
      <path d="M400 148C462 148 508 192 508 266C508 324 492 364 462 390C442 406 422 414 400 414C378 414 358 406 338 390C308 364 292 324 292 266C292 192 338 148 400 148Z" fill="url(#cSkin)"/>
      <path d="M496 214C506 240 509 290 500 330" fill="none" stroke="#FFD4A0" stroke-width="3" stroke-linecap="round" opacity=".3"/>
      <g id="cBeardG">
        <path d="M502 270C504 324 490 364 462 390C442 407 421 416 400 416C379 416 358 407 338 390C310 364 296 324 298 270C300 306 312 338 334 356C352 366 378 360 400 360C422 360 448 366 466 356C488 338 500 306 502 270Z" fill="#3B2E28" opacity=".3"/>
        <path d="M502 270C504 324 490 364 462 390C442 407 421 416 400 416C379 416 358 407 338 390C310 364 296 324 298 270C300 316 314 350 340 366C356 374 378 368 400 368C422 368 444 374 460 366C486 350 500 316 502 270Z" fill="url(#cBeard)"/>
      </g>
      <g id="cFace">
        <path d="M408 272C413 290 416 302 416 312" fill="none" stroke="#A56A48" stroke-width="3" stroke-linecap="round" opacity=".45"/>
        <ellipse cx="400" cy="319" rx="11" ry="7" fill="#B07350" opacity=".35"/>
        <ellipse cx="398" cy="305" rx="6" ry="9" fill="#E2AA82" opacity=".3"/>
        <path d="M387 313C380 321 386 331 395 328" fill="none" stroke="#8E5538" stroke-width="3.2" stroke-linecap="round"/>
        <path d="M413 313C420 321 414 331 405 328" fill="none" stroke="#8E5538" stroke-width="3.2" stroke-linecap="round"/>
        <path d="M316 296C328 310 342 316 354 316M484 296C472 310 458 316 446 316" fill="none" stroke="#9C6444" stroke-width="3" stroke-linecap="round" opacity=".22"/>
        <ellipse id="cLip" cx="400" cy="372" rx="15" ry="4.5" fill="#A7624E"/>
        <path id="cMouth" fill="#3E1414"/>
        <g clip-path="url(#cMouthClip)"><path id="cTeeth" fill="#FBFAF7"/><ellipse id="cTongue" cx="400" cy="380" rx="13" ry="6" fill="#C4575A"/></g>
        <path d="M350 368C352 350 372 340 400 347C428 340 448 350 450 368C446 359 436 353 422 353C414 353 406 356 400 359C394 356 386 353 378 353C364 353 354 359 350 368Z" fill="#2A1F1A"/>
        ${eye(358, 268, 'cEyeL')}
        ${eye(442, 268, 'cEyeR')}
        <path id="cBrowL" d="M390 240C375 227 349 221 322 229C346 229 370 237 388 249Z" fill="#17100D"/>
        <path id="cBrowR" d="M410 240C425 227 451 221 478 229C454 229 430 237 412 249Z" fill="#17100D"/>
      </g>
      <ellipse id="cGlowFace" cx="400" cy="330" rx="112" ry="92" fill="url(#cScreen)"/>
      <g id="cHair">
        <path d="M296 268C286 212 292 160 330 128C362 100 420 86 468 104C510 120 526 160 514 214C510 236 507 252 504 268L496 268C494 238 488 216 470 204C446 190 420 200 392 194C360 188 334 200 316 218C306 230 302 250 304 268Z" fill="url(#cHairG)"/>
        <path d="M330 150C360 120 410 106 452 116M346 172C380 146 428 140 470 152M314 198C330 172 356 160 386 158" fill="none" stroke="#4A382F" stroke-width="3.5" stroke-linecap="round" opacity=".7"/>
        <path d="M476 116C500 128 514 150 512 180" fill="none" stroke="#FFD4A0" stroke-width="3" stroke-linecap="round" opacity=".22"/>
      </g>
    </g>

    <g id="cSlotHead">
      <g id="cHeadset">
        <g id="cBandG"><path d="${band}" fill="none" stroke="#AEB6C2" stroke-width="16" stroke-linecap="round"/><path d="${band}" fill="none" stroke="#DDE3EA" stroke-width="11" stroke-linecap="round"/><path d="${band}" fill="none" stroke="#fff" stroke-width="2.5" opacity=".55"/></g>
        <rect x="266" y="246" width="38" height="76" rx="17" fill="#D3D9E1" stroke="#9AA3B0" stroke-width="1.5"/>
        <rect x="496" y="246" width="38" height="76" rx="17" fill="#D3D9E1" stroke="#9AA3B0" stroke-width="1.5"/>
        <rect x="294" y="252" width="10" height="64" rx="5" fill="#2A2F3A"/>
        <rect x="496" y="252" width="10" height="64" rx="5" fill="#2A2F3A"/>
        <rect x="272" y="260" width="7" height="48" rx="3.5" fill="#D6AF69"/>
        <rect x="521" y="260" width="7" height="48" rx="3.5" fill="#D6AF69"/>
        <g id="cMic"><path d="M284 316Q296 372 350 372" fill="none" stroke="#8F98A6" stroke-width="5" stroke-linecap="round"/><rect x="346" y="364" width="18" height="14" rx="7" fill="#2A2F3A"/></g>
      </g>
    </g>

    ${arm('cArmL')}
    ${arm('cArmR')}
  </g>

  <rect x="-3000" y="742" width="6800" height="1600" fill="url(#cDesk)"/>
  <rect x="-3000" y="742" width="6800" height="2.5" fill="#8A6A50" opacity=".6"/>
  <ellipse cx="400" cy="750" rx="270" ry="12" fill="#000" opacity=".45" filter="url(#cSoft)"/>
  <g id="cLaptop">
    <rect x="175" y="540" width="450" height="204" rx="18" fill="url(#cLid)"/>
    <rect x="176" y="541" width="448" height="202" rx="17" fill="none" stroke="rgba(255,255,255,.16)" stroke-width="1.5"/>
    <text x="400" y="664" text-anchor="middle" font-family="Bodoni Moda, Didot, Georgia, serif" font-style="italic" font-weight="500" font-size="48" fill="#F0D8A8" filter="url(#cGlow)">fg</text>
    <g transform="translate(236 590) rotate(-8)"><circle r="22" fill="#0B0B0B" stroke="#fff" stroke-width="2.5"/><text y="8" text-anchor="middle" font-family="Geist, Segoe UI, sans-serif" font-weight="700" font-size="22" fill="#fff">N</text></g>
    <g transform="translate(562 596) rotate(10)"><rect x="-24" y="-20" width="48" height="40" rx="10" fill="#1F7A5A"/><path d="M4 -13L-10 4H0L-4 14L10 -3H0Z" fill="#7CF0B8"/></g>
    <g transform="translate(548 700) rotate(-6)"><rect x="-18" y="-18" width="36" height="36" rx="6" fill="#3178C6"/><text x="4" y="12" text-anchor="middle" font-family="Geist, Segoe UI, sans-serif" font-weight="700" font-size="15" fill="#fff">TS</text></g>
    <g transform="translate(250 696) rotate(6)"><path d="M0 -24L21 -12L21 12L0 24L-21 12L-21 -12Z" fill="#D6AF69"/><text y="5.5" text-anchor="middle" font-family="Geist Mono, Consolas, monospace" font-weight="600" font-size="15" fill="#0B1220">AI</text></g>
    <rect x="146" y="738" width="508" height="13" rx="6.5" fill="url(#cBase)"/>
    <rect x="360" y="738" width="80" height="5" rx="2.5" fill="#5A6272"/>
  </g>
  <g transform="translate(684 684)">
    <path class="steam" d="M14 -8q7 -10 0 -20q-7 -10 0 -20" fill="none" stroke="#DDE6F3" stroke-width="3" stroke-linecap="round" opacity=".5"/>
    <path class="steam" d="M30 -6q7 -10 0 -20q-7 -10 0 -20" fill="none" stroke="#DDE6F3" stroke-width="3" stroke-linecap="round" opacity=".5"/>
    <path d="M46 16q20 0 20 18q0 18 -20 18" fill="none" stroke="#E9EDF3" stroke-width="7"/>
    <rect width="48" height="58" rx="9" fill="#E9EDF3"/><rect y="14" width="48" height="7" fill="#D6AF69"/>
  </g>
  <g transform="translate(70 690)">
    <path d="M0 -4C-10 -40 -4 -64 0 -76C4 -64 10 -40 0 -4Z" fill="#3E8A6A"/>
    <path d="M-4 -4C-30 -26 -40 -44 -44 -58C-26 -50 -12 -34 -4 -4Z" fill="#2F7458"/>
    <path d="M4 -4C30 -26 40 -44 44 -58C26 -50 12 -34 4 -4Z" fill="#2F7458"/>
    <path d="M-2 -4C-22 -12 -34 -16 -46 -16C-32 -26 -16 -22 -2 -4Z" fill="#27634B"/>
    <path d="M2 -4C22 -12 34 -16 46 -16C32 -26 16 -22 2 -4Z" fill="#27634B"/>
    <path d="M-26 0L26 0L20 52L-20 52Z" fill="#2B3448"/><rect x="-30" y="-6" width="60" height="10" rx="4" fill="#384259"/>
  </g>
</svg>`;
})();
