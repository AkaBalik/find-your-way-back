// =====================================================
// FIND YOUR WAY BACK — sketch.js
// =====================================================
// Canvas 1080×1920 — Instagram Story 9:16
// Fundo #01071E
// Partículas #FF3333
// Tipografia: Inter Tight
//
// FIND → YOUR → WAY → BACK
//
// MOUSE + TOUCH
// Toque = força
// Arrastar = desintegração
// Levantar = retorno
//
// Cada nova entrada no retrato revela uma palavra.
// Quando todas estão visíveis, nova entrada reinicia.
// =====================================================

let img;


// =====================================================
// ARRAYS — PERFORMANCE
// =====================================================

let px, py, homeX, homeY, vx, vy, tam, retorno;
let dormir;

let total = 0;


// =====================================================
// INPUT
// =====================================================

let inputX = -9999;
let inputY = -9999;

let inputAnteriorX = -9999;
let inputAnteriorY = -9999;

let inputVX = 0;
let inputVY = 0;

let inputAtivo = false;
let inputTouch = false;

let estavaNoRetrato = false;


// =====================================================
// TIPOGRAFIA
// =====================================================

let palavraAtual = 0;

let alphas = [0, 0, 0, 0];

const ALPHA_SPEED = 5;


// =====================================================
// ÁREA DO RETRATO
// =====================================================

let hotX, hotY, hotW, hotH;


// =====================================================
// FONTE
// =====================================================

let fonteCarregada = false;


// =====================================================
// CANVAS
// =====================================================

const CANVAS_W = 1080;
const CANVAS_H = 1920;

const RENDER_SCALE = 1.0;


// =====================================================
// IMAGEM
// =====================================================

const IMAGE_NAME = "cabeca_ponto.png";

// Mantido no valor que funciona correctamente.
const IMAGE_WIDTH = 600;


// =====================================================
// HALFTONE
// =====================================================

const SAMPLE_SPACING = 6;
const MAX_PARTICLES = 9000;


// =====================================================
// DEFINIÇÃO
// =====================================================

const GAMMA = 1.0;

const EDGE_BOOST = true;
const EDGE_THRESHOLD = 32;
const EDGE_BOOST_AMOUNT = 1.25;


// =====================================================
// TAMANHO DOS PONTOS
// =====================================================

const MIN_DOT_FRACTION = 0.14;
const MAX_DOT_FRACTION = 1.05;
const EDGE_BOOST_FRACTION_CAP = 1.35;


// =====================================================
// FÍSICA
// =====================================================

const MOUSE_RADIUS = 145;

const PUSH_FORCE = 5.5;

const RETURN_FORCE = 0.085;

const FRICTION = 0.82;

const MAX_SPEED = 26;

const VARIACAO_RETORNO = 0.4;

const SLEEP_VEL = 0.06;

const SLEEP_DIST = 0.4;


// =====================================================
// TOUCH — AJUSTES
// =====================================================

// Raio ligeiramente maior no telemóvel.
// O dedo cobre uma área maior que um cursor.
const TOUCH_RADIUS = 175;

// Intensidade adicional provocada pelo movimento.
const TOUCH_MOVEMENT_FORCE = 0.035;

// Limite de velocidade do dedo usado para calcular
// a intensidade da dispersão.
const TOUCH_MAX_SPEED = 45;


// =====================================================
// CORES
// =====================================================

const COR_FUNDO = "#01071E";
const COR_PARTICULAS = "#FF3333";
const COR_TIPO = "#FF3333";


// =====================================================
// COMPOSIÇÃO TIPOGRÁFICA
// =====================================================

const WORDS = [

  {
    text: "FIND",
    x: 35,
    y: 435,
    size: 285,
    align: "left",
    weight: 600,
    rotation: 0,
    spacing: -18
  },

  {
    text: "YOUR",
    x: 1015,
    y: 575,
    size: 185,
    align: "right",
    weight: 300,
    rotation: 0,
    spacing: -7
  },

  {
    text: "WAY",
    x: 35,
    y: 1210,
    size: 350,
    align: "left",
    weight: 600,
    rotation: 0,
    spacing: -24
  },

  {
    text: "BACK",
    x: 1045,
    y: 1635,
    size: 340,
    align: "right",
    weight: 600,
    rotation: 0,
    spacing: -24
  }

];


// =====================================================
// SETUP
// =====================================================

async function setup() {

  // Canvas interno continua exactamente 1080 × 1920.
  // Não definimos width/height via c.style().
  // O CSS passa agora a controlar o tamanho visual.
  const c = createCanvas(
    CANVAS_W * RENDER_SCALE,
    CANVAS_H * RENDER_SCALE
  );

  pixelDensity(1);

  noStroke();

  // Evita que o browser tente fazer scroll
  // enquanto o utilizador interage com a peça.
  c.elt.style.touchAction = "none";


  // ---------------------------------------------------
  // IMAGEM
  // ---------------------------------------------------

  img = await loadImage(
    IMAGE_NAME
  );

  img.resize(
    IMAGE_WIDTH,
    0
  );

  img.loadPixels();

  criarHalftone();

  console.log(
    "Partículas:",
    total
  );


  // ---------------------------------------------------
  // FONTE
  // ---------------------------------------------------

  const fontStyle =
    document.createElement("style");

  fontStyle.textContent = `
    @import url(
      'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300;400;600&display=swap'
    );
  `;

  document.head.appendChild(
    fontStyle
  );

  await document.fonts.load(
    '300 200px "Inter Tight"'
  );

  await document.fonts.load(
    '400 200px "Inter Tight"'
  );

  await document.fonts.load(
    '600 200px "Inter Tight"'
  );

  fonteCarregada = true;
}


// =====================================================
// LER BRILHO
// =====================================================

function brilhoEm(x, y) {

  const xc =
    constrain(
      x,
      0,
      img.width - 1
    );

  const yc =
    constrain(
      y,
      0,
      img.height - 1
    );

  const i =
    4 *
    (
      yc * img.width +
      xc
    );

  return (
    img.pixels[i] * 0.299 +
    img.pixels[i + 1] * 0.587 +
    img.pixels[i + 2] * 0.114
  );
}


// =====================================================
// CRIAR HALFTONE
// =====================================================

function criarHalftone() {

  const escala =
    min(
      (width * 1.08) / img.width,
      (height * 1.08) / img.height
    );

  const offsetX =
    (width - img.width * escala) / 2;

  const offsetY =
    (height - img.height * escala) / 2;

  hotX = offsetX;
  hotY = offsetY;

  hotW =
    img.width * escala;

  hotH =
    img.height * escala;

  const espacoCanvas =
    SAMPLE_SPACING * escala;

  const MIN_DOT =
    espacoCanvas *
    MIN_DOT_FRACTION;

  const MAX_DOT =
    espacoCanvas *
    MAX_DOT_FRACTION;

  const LIMITE =
    espacoCanvas *
    EDGE_BOOST_FRACTION_CAP;

  const cand = [];

  for (
    let y = 0;
    y < img.height;
    y += SAMPLE_SPACING
  ) {

    for (
      let x = 0;
      x < img.width;
      x += SAMPLE_SPACING
    ) {

      const b =
        brilhoEm(x, y);

      if (b < 245) {

        let grad = 0;

        if (EDGE_BOOST) {

          grad =
            abs(
              b -
              brilhoEm(
                x + SAMPLE_SPACING,
                y
              )
            ) +

            abs(
              b -
              brilhoEm(
                x,
                y + SAMPLE_SPACING
              )
            );
        }

        cand.push(
          x,
          y,
          b,
          grad
        );
      }
    }
  }

  const nCand =
    cand.length / 4;

  const passo =
    nCand > MAX_PARTICLES
      ? nCand / MAX_PARTICLES
      : 1;

  total =
    Math.min(
      nCand,
      MAX_PARTICLES
    );

  px =
    new Float32Array(total);

  py =
    new Float32Array(total);

  homeX =
    new Float32Array(total);

  homeY =
    new Float32Array(total);

  vx =
    new Float32Array(total);

  vy =
    new Float32Array(total);

  tam =
    new Float32Array(total);

  retorno =
    new Float32Array(total);

  dormir =
    new Uint8Array(total);

  let n = 0;

  for (
    let i = 0;
    i < nCand && n < total;
    i += passo
  ) {

    const k =
      Math.floor(i) * 4;

    const cx =
      cand[k];

    const cy =
      cand[k + 1];

    const b =
      cand[k + 2];

    const gr =
      cand[k + 3];

    const X =
      offsetX +
      cx * escala;

    const Y =
      offsetY +
      cy * escala;

    const comGamma =
      pow(
        b / 255,
        GAMMA
      ) * 255;

    let t =
      map(
        comGamma,
        0,
        255,
        MAX_DOT,
        MIN_DOT
      );

    if (
      EDGE_BOOST &&
      gr > EDGE_THRESHOLD
    ) {

      t *=
        EDGE_BOOST_AMOUNT;
    }

    t =
      constrain(
        t,
        MIN_DOT,
        LIMITE
      );

    const fatorMassa =
      1 -
      VARIACAO_RETORNO *
      constrain(
        map(
          t,
          MIN_DOT,
          MAX_DOT,
          0,
          1
        ),
        0,
        1
      );

    px[n] =
      homeX[n] =
      X;

    py[n] =
      homeY[n] =
      Y;

    tam[n] =
      t;

    retorno[n] =
      RETURN_FORCE *
      fatorMassa;

    dormir[n] =
      1;

    n++;
  }
}


// =====================================================
// REGISTAR INPUT
// =====================================================

function registarInput(x, y) {

  // Guarda a velocidade do movimento do input.
  if (
    inputAnteriorX > -9000 &&
    inputAnteriorY > -9000
  ) {

    inputVX =
      x - inputAnteriorX;

    inputVY =
      y - inputAnteriorY;
  }

  inputAnteriorX = x;
  inputAnteriorY = y;

  inputX = x;
  inputY = y;

  inputAtivo = true;


  // ---------------------------------------------------
  // ENTRADA NO RETRATO
  // ---------------------------------------------------

  const dentroDoRetrato =
    x > hotX &&
    x < hotX + hotW &&
    y > hotY &&
    y < hotY + hotH;

  if (
    dentroDoRetrato &&
    !estavaNoRetrato
  ) {

    revelarProximaPalavra();
  }

  estavaNoRetrato =
    dentroDoRetrato;
}


// =====================================================
// REVELAR PRÓXIMA PALAVRA
// =====================================================

function revelarProximaPalavra() {

  if (
    palavraAtual <
    WORDS.length
  ) {

    palavraAtual++;

  } else {

    // Depois de FIND YOUR WAY BACK,
    // a próxima entrada reinicia.
    palavraAtual = 0;
  }
}


// =====================================================
// TERMINAR INPUT
// =====================================================

function terminarInput() {

  inputAtivo = false;

  inputVX = 0;
  inputVY = 0;

  inputAnteriorX = -9999;
  inputAnteriorY = -9999;

  // Muito importante:
  // levantar o dedo termina a entrada.
  //
  // O próximo toque, mesmo no mesmo sítio,
  // será considerado uma NOVA entrada.
  estavaNoRetrato = false;
}


// =====================================================
// MOUSE
// =====================================================

function mouseMoved() {

  // Só usamos o rato quando não estamos
  // a utilizar touch.
  if (!inputTouch) {

    registarInput(
      mouseX,
      mouseY
    );
  }
}


function mouseDragged() {

  if (!inputTouch) {

    registarInput(
      mouseX,
      mouseY
    );
  }
}


function mouseReleased() {

  if (!inputTouch) {

    terminarInput();
  }
}


// =====================================================
// TOUCH
// =====================================================

function touchStarted() {

  inputTouch = true;

  if (
    touches &&
    touches.length > 0
  ) {

    registarInput(
      touches[0].x,
      touches[0].y
    );
  }

  return false;
}


function touchMoved() {

  inputTouch = true;

  if (
    touches &&
    touches.length > 0
  ) {

    registarInput(
      touches[0].x,
      touches[0].y
    );
  }

  return false;
}


function touchEnded() {

  terminarInput();

  inputTouch = false;

  return false;
}


// =====================================================
// DRAW
// =====================================================

function draw() {

  background(
    COR_FUNDO
  );

  atualizarFisica();

  desenharParticulas();

  if (fonteCarregada) {

    atualizarAlphas();

    desenharTipografia();
  }
}


// =====================================================
// ALPHAS
// =====================================================

function atualizarAlphas() {

  for (
    let i = 0;
    i < WORDS.length;
    i++
  ) {

    const deveEstarVisivel =
      i < palavraAtual;

    if (deveEstarVisivel) {

      alphas[i] =
        min(
          255,
          alphas[i] +
          ALPHA_SPEED
        );

    } else {

      alphas[i] =
        max(
          0,
          alphas[i] -
          ALPHA_SPEED
        );
    }
  }
}


// =====================================================
// TIPOGRAFIA
// =====================================================

function desenharTipografia() {

  for (
    let i = 0;
    i < WORDS.length;
    i++
  ) {

    if (
      alphas[i] <= 0
    ) {

      continue;
    }

    const w =
      WORDS[i];

    push();


    // -------------------------------------------------
    // POSIÇÃO
    // -------------------------------------------------

    translate(
      w.x,
      w.y
    );


    // -------------------------------------------------
    // ROTAÇÃO
    // -------------------------------------------------

    rotate(
      w.rotation
    );


    // -------------------------------------------------
    // FONTE
    // -------------------------------------------------

    textFont(
      "Inter Tight"
    );

    textSize(
      w.size
    );


    // -------------------------------------------------
    // PESO
    // -------------------------------------------------

    drawingContext.font =
      `${w.weight} ${w.size}px "Inter Tight"`;


    // -------------------------------------------------
    // ALINHAMENTO
    // -------------------------------------------------

    textAlign(
      w.align === "right"
        ? "right"
        : "left",
      "top"
    );


    // -------------------------------------------------
    // TRACKING
    // -------------------------------------------------

    drawingContext.letterSpacing =
      w.spacing + "px";


    // -------------------------------------------------
    // COR
    // -------------------------------------------------

    fill(
      255,
      51,
      51,
      alphas[i]
    );

    noStroke();


    // -------------------------------------------------
    // TEXTO
    // -------------------------------------------------

    text(
      w.text,
      0,
      0
    );

    drawingContext.letterSpacing =
      "0px";

    pop();
  }
}


// =====================================================
// FÍSICA
// =====================================================

function atualizarFisica() {

  // Touch usa um campo ligeiramente maior.
  const raio =
    inputTouch
      ? TOUCH_RADIUS
      : MOUSE_RADIUS;

  const raioQ =
    raio * raio;

  const minX =
    inputX - raio;

  const maxX =
    inputX + raio;

  const minY =
    inputY - raio;

  const maxY =
    inputY + raio;

  const sleepVelQ =
    SLEEP_VEL *
    SLEEP_VEL;

  const sleepDistQ =
    SLEEP_DIST *
    SLEEP_DIST;


  // ---------------------------------------------------
  // VELOCIDADE DO DEDO
  // ---------------------------------------------------

  const velocidadeInput =
    Math.sqrt(
      inputVX * inputVX +
      inputVY * inputVY
    );

  const intensidadeMovimento =
    inputTouch
      ? constrain(
          velocidadeInput /
          TOUCH_MAX_SPEED,
          0,
          1
        )
      : 0;


  for (
    let i = 0;
    i < total;
    i++
  ) {

    const x =
      px[i];

    const y =
      py[i];

    const perto =
      inputAtivo &&
      x > minX &&
      x < maxX &&
      y > minY &&
      y < maxY;

    if (
      dormir[i] === 1 &&
      !perto
    ) {

      continue;
    }

    let vX =
      vx[i];

    let vY =
      vy[i];


    // -------------------------------------------------
    // REGRESSO À POSIÇÃO ORIGINAL
    // -------------------------------------------------

    vX +=
      (homeX[i] - x) *
      retorno[i];

    vY +=
      (homeY[i] - y) *
      retorno[i];


    // -------------------------------------------------
    // FORÇA DO INPUT
    // -------------------------------------------------

    if (perto) {

      const dx =
        x - inputX;

      const dy =
        y - inputY;

      const dQ =
        dx * dx +
        dy * dy;

      if (
        dQ > 0 &&
        dQ < raioQ
      ) {

        const d =
          Math.sqrt(dQ);

        const inten =
          1 - d / raio;

        // Força base.
        let forca =
          inten *
          inten *
          PUSH_FORCE;


        // -------------------------------------------------
        // TOUCH DINÂMICO
        // -------------------------------------------------

        // Quanto mais rápido o dedo se move,
        // mais violenta é a dispersão.

        if (inputTouch) {

          forca *=
            1 +
            intensidadeMovimento *
            1.8;

          // O próprio movimento do dedo
          // transmite energia às partículas.

          vX +=
            inputVX *
            intensidadeMovimento *
            TOUCH_MOVEMENT_FORCE *
            inten;

          vY +=
            inputVY *
            intensidadeMovimento *
            TOUCH_MOVEMENT_FORCE *
            inten;
        }


        // Evita divisão problemática.
        const direcaoX =
          dx / d;

        const direcaoY =
          dy / d;

        vX +=
          direcaoX *
          forca;

        vY +=
          direcaoY *
          forca;

        dormir[i] =
          0;
      }
    }


    // ---------------------------------------------------
    // FRICÇÃO
    // ---------------------------------------------------

    vX *=
      FRICTION;

    vY *=
      FRICTION;


    // ---------------------------------------------------
    // LIMITE DE VELOCIDADE
    // ---------------------------------------------------

    const velQ =
      vX * vX +
      vY * vY;

    if (
      velQ >
      MAX_SPEED * MAX_SPEED
    ) {

      const v =
        Math.sqrt(
          velQ
        );

      vX =
        (vX / v) *
        MAX_SPEED;

      vY =
        (vY / v) *
        MAX_SPEED;
    }


    // ---------------------------------------------------
    // NOVA POSIÇÃO
    // ---------------------------------------------------

    const nx =
      x + vX;

    const ny =
      y + vY;

    px[i] =
      nx;

    py[i] =
      ny;

    vx[i] =
      vX;

    vy[i] =
      vY;


    // ---------------------------------------------------
    // ADORMECER QUANDO REGRESSA
    // ---------------------------------------------------

    const dHx =
      homeX[i] - nx;

    const dHy =
      homeY[i] - ny;

    if (
      velQ < sleepVelQ &&
      dHx * dHx +
      dHy * dHy <
      sleepDistQ
    ) {

      px[i] =
        homeX[i];

      py[i] =
        homeY[i];

      vx[i] =
        0;

      vy[i] =
        0;

      dormir[i] =
        1;
    }
  }


  // ---------------------------------------------------
  // REDUZ GRADUALMENTE A VELOCIDADE DO INPUT
  // ---------------------------------------------------

  // Isto torna o movimento mais orgânico.

  inputVX *= 0.82;
  inputVY *= 0.82;
}


// =====================================================
// DESENHAR PARTÍCULAS
// =====================================================

function desenharParticulas() {

  fill(
    COR_PARTICULAS
  );

  for (
    let i = 0;
    i < total;
    i++
  ) {

    circle(
      px[i],
      py[i],
      tam[i]
    );
  }
}


// =====================================================
// FULLSCREEN
// =====================================================

function doubleClicked() {

  fullscreen(
    !fullscreen()
  );
}
