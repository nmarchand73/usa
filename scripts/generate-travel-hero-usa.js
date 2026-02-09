/**
 * Génère le livre « dont vous êtes le héros » USA 50 États
 * À partir de app-data.json et data/paragraphs-usa.js
 * Sortie : book/Livre_Heros_USA_50_Etats.docx
 */

const path = require('path');
const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, PageNumber, BorderStyle,
  WidthType, ShadingType, HeadingLevel, PageBreak,
  InternalHyperlink, Bookmark
} = require('docx');

// ═══════════════════════════════════════════════════════════════
// DONNÉES
// ═══════════════════════════════════════════════════════════════

const appDataPath = path.join(__dirname, '../public/app-data.json');
const appData = JSON.parse(fs.readFileSync(appDataPath, 'utf8'));
const stateMap = appData.stateMap || {};

const rawParagraphs = require(path.join(__dirname, '../data/paragraphs-usa.js'));

// Paragraphe numéro → code État (pour injection contraste/chiffre/conseil/lieux)
const PARA_TO_STATE = {
  8: 'ME', 9: 'VT', 10: 'NH', 11: 'MA', 12: 'RI', 13: 'CT', 14: 'NY', 15: 'NJ', 16: 'PA',
  18: 'DE', 19: 'MD', 20: 'DC', 21: 'VA', 22: 'WV', 23: 'NC', 24: 'SC', 25: 'GA', 26: 'FL',
  27: 'KY', 28: 'TN', 29: 'AL', 30: 'MS', 31: 'LA', 32: 'AR', 33: 'OK', 34: 'TX',
  36: 'MI', 37: 'OH', 38: 'IN', 39: 'IL', 40: 'WI', 41: 'MN', 42: 'IA', 43: 'MO', 44: 'KS',
  45: 'NE', 46: 'SD', 47: 'ND',
  49: 'MT', 50: 'ID', 51: 'WY', 52: 'CO', 53: 'NM', 54: 'AZ', 55: 'UT', 56: 'NV',
  58: 'WA', 59: 'OR', 60: 'CA', 61: 'AK', 62: 'HI'
};

function enrichParagraph(para, stateMap) {
  const code = PARA_TO_STATE[para.number];
  if (!code || !stateMap[code]) return para.text;

  const state = stateMap[code];
  let text = para.text;

  // Supprimer le texte par défaut entre les placeholders (évite la duplication)
  if (text.includes('{{CONTRASTE}}') && text.includes('{{CHIFFRE}}')) {
    text = text.replace(/\{\{CONTRASTE\}\}[^]*?\{\{CHIFFRE\}\}/, '{{CONTRASTE}} {{CHIFFRE}}');
  }
  if (text.includes('{{CHIFFRE}}') && text.includes('{{CONSEIL}}')) {
    text = text.replace(/\{\{CHIFFRE\}\}[^]*?\{\{CONSEIL\}\}/, '{{CHIFFRE}} {{CONSEIL}}');
  }
  if (text.includes('{{CONSEIL}}')) {
    text = text.replace(/\{\{CONSEIL\}\}[^]*$/, '{{CONSEIL}}');
  }

  // Remplir avec les données app-data (une seule fois)
  if (text.includes('{{CONTRASTE}}')) {
    text = text.replace(/\{\{CONTRASTE\}\}/g, (state.contraste || '').trim() + ' ');
  }
  if (text.includes('{{CHIFFRE}}')) {
    text = text.replace(/\{\{CHIFFRE\}\}/g, (state.chiffre || '').trim() + ' ');
  }
  if (text.includes('{{CONSEIL}}')) {
    text = text.replace(/\{\{CONSEIL\}\}/g, (state.conseil || '').trim());
  }

  // Enrichissement : lieux remarquables (détails passionnants)
  const lr = state.lieuxRemarquables;
  if (lr) {
    const culture = (lr.culture && lr.culture[0]) ? lr.culture[0] : '';
    const parcs = (lr.parcs && lr.parcs[0]) ? lr.parcs[0] : '';
    const nature = (lr.nature && lr.nature[0]) ? lr.nature[0] : '';
    const lieux = [culture, parcs, nature].filter(Boolean);
    if (lieux.length) {
      text += ' À ne pas manquer : ' + lieux.join(', ') + '.';
    }
    if (state.atouts && state.atouts[0]) {
      text += ' ' + state.atouts[0] + '.';
    }
  }

  return text.trim();
}

const PARAGRAPHS = rawParagraphs.map(p => ({
  ...p,
  text: p.text && (p.text.includes('{{CONTRASTE}}') || p.text.includes('{{CHIFFRE}}') || p.text.includes('{{CONSEIL}}'))
    ? enrichParagraph(p, stateMap)
    : p.text
}));

// ═══════════════════════════════════════════════════════════════
// CONFIG LIVRE
// ═══════════════════════════════════════════════════════════════

const BOOK_CONFIG = {
  destination: "États-Unis (50 États)",
  title: "Votre aventure à travers les 50 États",
  subtitle: "Un livre dont vous êtes le héros",
  author: "Généré à partir des données du projet USA 50 États",
  outputPath: path.join(__dirname, '../book/Livre_Heros_USA_50_Etats.docx'),
  language: "fr"
};

// ═══════════════════════════════════════════════════════════════
// DESIGN (aligné travel-hero-book)
// ═══════════════════════════════════════════════════════════════

const DESIGN = {
  fonts: {
    display: "Cambria",
    heading: "Cambria",
    body: "Calibri",
    accent: "Calibri Light"
  },
  sizes: {
    bookTitle: 80,
    subtitle: 32,
    chapterTitle: 48,
    paragraphNumber: 28,
    body: 24,
    choice: 23,
    choiceNumber: 24,
    footer: 18,
    decorative: 16
  },
  colors: {
    primary: "2C3E50",
    secondary: "E74C3C",
    accent: "F39C12",
    text: "2C3E50",
    textLight: "5D6D7E",
    link: "2980B9",
    linkHover: "1A5276",
    background: "FDFEFE",
    decorative: "BDC3C7",
    box: "FEF9E7",
    boxBorder: "F5B041"
  },
  spacing: {
    paragraphBefore: 240,
    paragraphAfter: 240,
    lineHeight: 300,
    choiceBefore: 120,
    choiceAfter: 80,
    sectionGap: 480
  }
};

// ═══════════════════════════════════════════════════════════════
// LABELS (sections = régions USA)
// ═══════════════════════════════════════════════════════════════

const LABELS = {
  fr: {
    coverSubtitle: "Un livre dont vous êtes le héros",
    howToPlay: "Comment jouer",
    howToPlayText: "Ce livre n'est pas un récit ordinaire. Vous êtes le personnage principal de cette aventure. À la fin de chaque paragraphe, vous devrez faire un choix qui déterminera la suite de votre exploration. Cliquez sur les numéros en bleu pour naviguer directement vers votre prochaine destination. Laissez-vous guider par votre curiosité et votre instinct !",
    startText: "Cliquez sur le 1 ci-dessous pour commencer votre aventure.",
    clickToStart: "COMMENCER L'AVENTURE",
    endText: "— FIN —",
    chapters: {
      prologue: "Prologue",
      northeast: "Nord-Est",
      south: "Sud",
      midwest: "Midwest",
      mountain: "Rocheuses & Sud-Ouest",
      pacific: "Côte Pacifique",
      reflection: "Réflexions & Pause",
      epilogue: "Épilogue"
    }
  }
};

// ═══════════════════════════════════════════════════════════════
// HELPERS DOCX
// ═══════════════════════════════════════════════════════════════

function decorativeLine() {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 200 },
    children: [new TextRun({
      text: "─────────  ✦  ─────────",
      font: DESIGN.fonts.accent,
      size: DESIGN.sizes.decorative,
      color: DESIGN.colors.decorative
    })]
  });
}

function createBookmark(paragraphNumber) {
  return `para_${paragraphNumber}`;
}

function createClickableLink(targetParagraph, displayText) {
  return new InternalHyperlink({
    anchor: createBookmark(targetParagraph),
    children: [
      new TextRun({
        text: displayText || String(targetParagraph),
        font: DESIGN.fonts.body,
        size: DESIGN.sizes.choiceNumber,
        bold: true,
        color: DESIGN.colors.link,
        underline: { type: "single", color: DESIGN.colors.link }
      })
    ]
  });
}

function howToPlayBox(lang) {
  const L = LABELS[lang];
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({
      children: [new TableCell({
        borders: {
          top: { style: BorderStyle.SINGLE, size: 12, color: DESIGN.colors.boxBorder },
          bottom: { style: BorderStyle.SINGLE, size: 12, color: DESIGN.colors.boxBorder },
          left: { style: BorderStyle.SINGLE, size: 2, color: DESIGN.colors.boxBorder },
          right: { style: BorderStyle.SINGLE, size: 2, color: DESIGN.colors.boxBorder }
        },
        shading: { fill: DESIGN.colors.box, type: ShadingType.CLEAR },
        margins: { top: 400, bottom: 400, left: 500, right: 500 },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [new TextRun({
              text: L.howToPlay,
              font: DESIGN.fonts.heading,
              size: 32,
              bold: true,
              color: DESIGN.colors.primary
            })]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 250, line: 300 },
            children: [new TextRun({
              text: L.howToPlayText,
              font: DESIGN.fonts.body,
              size: DESIGN.sizes.body,
              color: DESIGN.colors.text
            })]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200 },
            children: [new TextRun({
              text: L.startText,
              font: DESIGN.fonts.body,
              size: DESIGN.sizes.body,
              italics: true,
              color: DESIGN.colors.textLight
            })]
          })
        ]
      })]
    })]
  });
}

function coverPage(config, lang) {
  const L = LABELS[lang];
  return [
    new Paragraph({ spacing: { before: 1800 }, children: [] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [new TextRun({
        text: config.title,
        font: DESIGN.fonts.display,
        size: DESIGN.sizes.bookTitle,
        bold: true,
        color: DESIGN.colors.primary
      })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
      children: [new TextRun({
        text: L.coverSubtitle,
        font: DESIGN.fonts.accent,
        size: DESIGN.sizes.subtitle,
        italics: true,
        color: DESIGN.colors.textLight
      })]
    }),
    decorativeLine(),
    new Paragraph({ spacing: { before: 800 }, children: [] }),
    howToPlayBox(lang),
    new Paragraph({ spacing: { before: 600 }, children: [] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400 },
      children: [
        new TextRun({ text: "▶  ", font: DESIGN.fonts.body, size: 28, color: DESIGN.colors.accent }),
        createClickableLink(1, L.clickToStart),
        new TextRun({ text: "  ◀", font: DESIGN.fonts.body, size: 28, color: DESIGN.colors.accent })
      ]
    }),
    new Paragraph({ children: [new PageBreak()] })
  ];
}

function chapterHeader(title) {
  return [
    new Paragraph({
      pageBreakBefore: true,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({
        text: "✦",
        font: DESIGN.fonts.accent,
        size: 28,
        color: DESIGN.colors.accent
      })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [new TextRun({
        text: title.toUpperCase(),
        font: DESIGN.fonts.heading,
        size: DESIGN.sizes.chapterTitle,
        bold: true,
        characterSpacing: 60,
        color: DESIGN.colors.primary
      })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
      children: [new TextRun({
        text: "✦",
        font: DESIGN.fonts.accent,
        size: 28,
        color: DESIGN.colors.accent
      })]
    })
  ];
}

function paragraphBlock(para, lang) {
  const L = LABELS[lang];
  const elements = [];
  const bookmarkId = createBookmark(para.number);

  elements.push(new Paragraph({
    spacing: { before: DESIGN.spacing.sectionGap, after: 300 },
    children: [
      new TextRun({
        text: "§ ",
        font: DESIGN.fonts.accent,
        size: DESIGN.sizes.paragraphNumber,
        color: DESIGN.colors.accent
      }),
      new Bookmark({
        id: bookmarkId,
        children: [
          new TextRun({
            text: String(para.number),
            font: DESIGN.fonts.display,
            size: DESIGN.sizes.paragraphNumber + 8,
            bold: true,
            color: DESIGN.colors.secondary
          })
        ]
      })
    ]
  }));

  const textParts = (para.text || '').split('\n\n');
  textParts.forEach((part, index) => {
    elements.push(new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: {
        before: index === 0 ? 0 : DESIGN.spacing.paragraphBefore,
        after: DESIGN.spacing.paragraphAfter,
        line: DESIGN.spacing.lineHeight
      },
      indent: { firstLine: 400 },
      children: [new TextRun({
        text: part.trim(),
        font: DESIGN.fonts.body,
        size: DESIGN.sizes.body,
        color: DESIGN.colors.text
      })]
    }));
  });

  if (para.choices && para.choices.length > 0) {
    elements.push(new Paragraph({
      spacing: { before: 400, after: 200 },
      children: [new TextRun({
        text: "Que faites-vous ?",
        font: DESIGN.fonts.body,
        size: DESIGN.sizes.body,
        italics: true,
        color: DESIGN.colors.textLight
      })]
    }));
    para.choices.forEach((choice) => {
      elements.push(new Paragraph({
        spacing: { before: DESIGN.spacing.choiceBefore, after: DESIGN.spacing.choiceAfter },
        indent: { left: 600 },
        children: [
          new TextRun({
            text: "▸ ",
            font: DESIGN.fonts.body,
            size: DESIGN.sizes.choice,
            color: DESIGN.colors.accent
          }),
          new TextRun({
            text: `${choice.text} → `,
            font: DESIGN.fonts.body,
            size: DESIGN.sizes.choice,
            color: DESIGN.colors.text
          }),
          createClickableLink(choice.target)
        ]
      }));
    });
  }

  if (para.isEnding) {
    elements.push(decorativeLine());
    elements.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 400 },
      children: [new TextRun({
        text: L.endText,
        font: DESIGN.fonts.display,
        size: 36,
        bold: true,
        italics: true,
        color: DESIGN.colors.secondary
      })]
    }));
    elements.push(decorativeLine());
  } else {
    elements.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 200 },
      children: [new TextRun({
        text: "· · ·",
        font: DESIGN.fonts.accent,
        size: 24,
        color: DESIGN.colors.decorative
      })]
    }));
  }

  return elements;
}

const SECTION_ORDER = ['prologue', 'northeast', 'south', 'midwest', 'mountain', 'pacific', 'reflection', 'epilogue'];

function generateContent(config, paragraphs, lang) {
  const L = LABELS[lang];
  const content = [];
  content.push(...coverPage(config, lang));

  const sections = {};
  paragraphs.forEach(p => {
    if (!sections[p.section]) sections[p.section] = [];
    sections[p.section].push(p);
  });

  SECTION_ORDER.forEach(sectionKey => {
    const sectionParagraphs = sections[sectionKey];
    if (sectionParagraphs && sectionParagraphs.length > 0) {
      const chapterName = L.chapters[sectionKey] || sectionKey;
      content.push(...chapterHeader(chapterName));
      sectionParagraphs.sort((a, b) => a.number - b.number);
      sectionParagraphs.forEach(para => {
        content.push(...paragraphBlock(para, lang));
      });
    }
  });

  return content;
}

// ═══════════════════════════════════════════════════════════════
// GÉNÉRATION DOCUMENT
// ═══════════════════════════════════════════════════════════════

const lang = BOOK_CONFIG.language;

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: DESIGN.fonts.body, size: DESIGN.sizes.body }
      }
    },
    paragraphStyles: [
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: DESIGN.sizes.chapterTitle, bold: true, font: DESIGN.fonts.heading, color: DESIGN.colors.primary },
        paragraph: { spacing: { before: 480, after: 360 }, outlineLevel: 0 }
      }
    ],
    characterStyles: [
      {
        id: "Hyperlink",
        name: "Hyperlink",
        run: { color: DESIGN.colors.link, underline: { type: "single" } }
      }
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1440, right: 1260, bottom: 1440, left: 1260 }
      }
    },
    headers: {
      default: new Header({
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({ text: "✦  ", font: DESIGN.fonts.accent, size: 14, color: DESIGN.colors.decorative }),
              new TextRun({ text: BOOK_CONFIG.title, font: DESIGN.fonts.accent, size: DESIGN.sizes.footer, italics: true, color: DESIGN.colors.textLight }),
              new TextRun({ text: "  ✦", font: DESIGN.fonts.accent, size: 14, color: DESIGN.colors.decorative })
            ]
          })
        ]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "─  ", font: DESIGN.fonts.accent, size: DESIGN.sizes.footer, color: DESIGN.colors.decorative }),
            new TextRun({ children: [PageNumber.CURRENT], font: DESIGN.fonts.body, size: DESIGN.sizes.footer, bold: true, color: DESIGN.colors.textLight }),
            new TextRun({ text: "  ─", font: DESIGN.fonts.accent, size: DESIGN.sizes.footer, color: DESIGN.colors.decorative })
          ]
        })]
      })
    },
    children: generateContent(BOOK_CONFIG, PARAGRAPHS, lang)
  }]
});

// Écriture
const bookDir = path.join(__dirname, '../book');
if (!fs.existsSync(bookDir)) {
  fs.mkdirSync(bookDir, { recursive: true });
}

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(BOOK_CONFIG.outputPath, buffer);
  console.log('Livre généré :', BOOK_CONFIG.outputPath);
  console.log('Paragraphes :', PARAGRAPHS.length);
  console.log('Destination :', BOOK_CONFIG.destination);
}).catch(err => {
  console.error('Erreur :', err);
});
