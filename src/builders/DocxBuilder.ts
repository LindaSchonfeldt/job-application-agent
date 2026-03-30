import { USER } from '../data/USER';
import { ALL_EXPERIENCES } from '../data/ALL_EXPERIENCES';

export interface CvData {
  jobTitle: string
  about: string
  experiences: any[]
  includeMind: boolean
  skills: string
}

export class DocxBuilder {
  cvData: CvData

  constructor(cvData: CvData) {
    this.cvData = cvData
  }

  async build(): Promise<Blob> {
    const {
      Document,
      Packer,
      Paragraph,
      TextRun,
      AlignmentType,
      BorderStyle,
      LevelFormat
    } = (window as any).docx

    const FONT = 'Calibri'
    const ACCENT = '1A1A2E'
    const GRAY = '666666'
    const RULE = 'CCCCCC'

    function sectionHeading(text: string) {
      return new Paragraph({
        children: [
          new TextRun({
            text: text.toUpperCase(),
            bold: true,
            size: 20,
            font: FONT,
            color: ACCENT,
            characterSpacing: 40
          })
        ],
        spacing: { before: 320, after: 100 },
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 3, color: RULE, space: 4 }
        }
      })
    }
    function jobTitle(titel: string, arbetsgivare: string, period: string) {
      return new Paragraph({
        children: [
          new TextRun({ text: titel, bold: true, size: 22, font: FONT }),
          new TextRun({ text: '  –  ' + arbetsgivare, size: 22, font: FONT }),
          new TextRun({
            text: '     ' + period,
            size: 20,
            font: FONT,
            color: GRAY,
            italics: true
          })
        ],
        spacing: { before: 180, after: 40 }
      })
    }
    function bullet(text: string) {
      return new Paragraph({
        numbering: { reference: 'bullets', level: 0 },
        children: [
          new TextRun({ text, size: 20, font: FONT, color: '222222' })
        ],
        spacing: { before: 20, after: 20 }
      })
    }
    function body(text: string) {
      return new Paragraph({
        children: [new TextRun({ text, size: 22, font: FONT })],
        spacing: { before: 40, after: 40 }
      })
    }

    const children: any[] = [
      new Paragraph({
        children: [
          new TextRun({
            text: USER.name,
            bold: true,
            size: 52,
            font: FONT,
            color: ACCENT
          })
        ],
        spacing: { before: 0, after: 80 }
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: this.cvData.jobTitle || '',
            size: 26,
            font: FONT,
            color: GRAY
          })
        ],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [
          new TextRun({ text: USER.contact, size: 20, font: FONT }),
          new TextRun({
            text: '  ·  ' + USER.website,
            size: 20,
            font: FONT,
            color: GRAY
          })
        ],
        spacing: { after: 20 }
      }),
      new Paragraph({
        border: {
          bottom: {
            style: BorderStyle.SINGLE,
            size: 8,
            color: ACCENT,
            space: 6
          }
        },
        spacing: { before: 60, after: 0 }
      }),
      sectionHeading('Om mig'),
      new Paragraph({
        children: [
          new TextRun({ text: this.cvData.about || '', size: 22, font: FONT })
        ],
        spacing: { before: 100, after: 60 }
      }),
      sectionHeading('Arbetslivserfarenhet')
    ]

    for (const exp of this.cvData.experiences || []) {
      const base = ALL_EXPERIENCES[exp.key]
      if (!base) continue
      children.push(
        jobTitle(
          exp.titleOverride || base.title,
          base.employer,
          base.period
        )
      )
      for (const p of exp.bullets || base.details)
        children.push(bullet(p))
    }

    if (this.cvData.includeMind) {
      const volunteers = Object.values(ALL_EXPERIENCES).filter(e => e.type === 'volunteer');
      if (volunteers.length > 0) {
        children.push(sectionHeading('Övrig erfarenhet'));
        for (const v of volunteers) {
          children.push(jobTitle(v.title, v.employer, v.period));
          for (const p of v.details) children.push(bullet(p));
        }
      }
    }

    children.push(sectionHeading('Utbildning'))
    for (const u of USER.education) {
      children.push(body(u.name + '  |  ' + u.period));
    }

    children.push(sectionHeading('Kunskaper & övrigt'))
    children.push(body(this.cvData.skills || ''))

    const doc = new Document({
      numbering: {
        config: [
          {
            reference: 'bullets',
            levels: [
              {
                level: 0,
                format: LevelFormat.BULLET,
                text: '•',
                alignment: AlignmentType.LEFT,
                style: { paragraph: { indent: { left: 440, hanging: 280 } } }
              }
            ]
          }
        ]
      },
      styles: { default: { document: { run: { font: FONT, size: 22 } } } },
      sections: [
        {
          properties: {
            page: {
              size: { width: 11906, height: 16838 },
              margin: { top: 1200, right: 1300, bottom: 1200, left: 1300 }
            }
          },
          children
        }
      ]
    })

    return await Packer.toBlob(doc)
  }
}
