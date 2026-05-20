import { useMemo, useState } from 'react'
import { jsPDF } from 'jspdf'
import './App.css'

type Category = 'Architecture' | 'Feature' | 'QA' | 'Integration' | 'Mobile'
type Priority = 'required' | 'recommended' | 'optional'

type WorkBlock = {
  id: string
  title: string
  description: string
  min: number
  max: number
  category: Category
  priority: Priority
  consequence?: string
}

type Milestone = {
  id: string
  title: string
  killerFeature: string
  blocks: WorkBlock[]
}

const milestones: Milestone[] = [
  {
    id: 'm1',
    title: 'Milestone 1 — Platform foundation',
    killerFeature:
      'У системі можна створювати організації, користувачів і базові ролі з ізоляцією даних.',
    blocks: [
      {
        id: 'm1-auth',
        title: 'Authentication & sessions',
        description: 'Login, password reset, session handling.',
        min: 35,
        max: 55,
        category: 'Architecture',
        priority: 'required',
      },
      {
        id: 'm1-orgs',
        title: 'Organizations model',
        description: 'Вантажовласники, перевізники, Grandar internal org.',
        min: 35,
        max: 55,
        category: 'Architecture',
        priority: 'required',
      },
      {
        id: 'm1-rbac',
        title: 'Role-based access',
        description: 'Базові ролі й permissions для MVP.',
        min: 50,
        max: 75,
        category: 'Architecture',
        priority: 'required',
      },
      {
        id: 'm1-admin',
        title: 'Admin basics',
        description: 'Створення/редагування компаній і користувачів.',
        min: 50,
        max: 75,
        category: 'Feature',
        priority: 'required',
      },
      {
        id: 'm1-blocking',
        title: 'Company blocking & verification status',
        description: 'Блокування компаній, базовий статус верифікації.',
        min: 18,
        max: 30,
        category: 'Feature',
        priority: 'recommended',
        consequence: 'Компанії можна буде заводити, але блокування/верифікаційні статуси доведеться контролювати вручну.',
      },
      {
        id: 'm1-audit',
        title: 'Audit foundation',
        description: 'Логування тільки критичних дій MVP.',
        min: 20,
        max: 35,
        category: 'Architecture',
        priority: 'recommended',
        consequence: 'Менше прозорості щодо того, хто змінив заявку, доступи або фінансові дані.',
      },
      {
        id: 'm1-qa',
        title: 'QA',
        description: 'Role/access testing, базові negative cases.',
        min: 30,
        max: 45,
        category: 'QA',
        priority: 'required',
      },
    ],
  },
  {
    id: 'm2',
    title: 'Milestone 2 — Cargo owner onboarding & request',
    killerFeature:
      'Вантажовласник може створити заявку, зберегти її як чернетку й опублікувати для matching.',
    blocks: [
      {
        id: 'm2-portal',
        title: 'Cargo owner portal',
        description: 'Список заявок, статуси, базовий профіль компанії.',
        min: 45,
        max: 70,
        category: 'Feature',
        priority: 'required',
      },
      {
        id: 'm2-form',
        title: 'Shipment request form',
        description: 'Маршрут, базові точки, вантаж, вимоги до ТЗ, контакти.',
        min: 55,
        max: 85,
        category: 'Feature',
        priority: 'required',
      },
      {
        id: 'm2-multipoint',
        title: 'Expanded multi-point route',
        description: 'Декілька додаткових точок маршруту й edge cases валідації.',
        min: 20,
        max: 35,
        category: 'Feature',
        priority: 'recommended',
        consequence: 'MVP стартує з простішим маршрутом; складні мультиточкові сценарії доведеться вести вручну або додати пізніше.',
      },
      {
        id: 'm2-pricing',
        title: 'Pricing input',
        description: 'Ціна, валюта, базова видимість.',
        min: 20,
        max: 35,
        category: 'Feature',
        priority: 'required',
      },
      {
        id: 'm2-attachments',
        title: 'Attachments',
        description: 'Базові вкладення до заявки.',
        min: 25,
        max: 45,
        category: 'Feature',
        priority: 'recommended',
        consequence: 'Документи до заявки доведеться передавати поза платформою до етапу рейсу.',
      },
      {
        id: 'm2-draft',
        title: 'Draft/publish flow',
        description: 'Чернетка, публікація, валідація.',
        min: 30,
        max: 50,
        category: 'Feature',
        priority: 'required',
      },
      {
        id: 'm2-qa',
        title: 'QA',
        description: 'Validation, visibility, базові edge cases.',
        min: 30,
        max: 50,
        category: 'QA',
        priority: 'required',
      },
    ],
  },
  {
    id: 'm3',
    title: 'Milestone 3 — Carrier onboarding',
    killerFeature:
      'Перевізник може бути заведений у систему, додати авто/водіїв і бути готовим приймати заявки.',
    blocks: [
      {
        id: 'm3-portal',
        title: 'Carrier portal',
        description: 'Профіль перевізника, користувачі, статус.',
        min: 40,
        max: 65,
        category: 'Feature',
        priority: 'required',
      },
      {
        id: 'm3-carrier-users',
        title: 'Carrier user management',
        description: 'Користувачі перевізника, базове редагування доступів.',
        min: 18,
        max: 30,
        category: 'Feature',
        priority: 'recommended',
        consequence: 'Користувачів перевізника доведеться додавати через адміністратора Grandar.',
      },
      {
        id: 'm3-fleet',
        title: 'Fleet management',
        description: 'Авто, тип ТЗ, тоннаж, активність.',
        min: 50,
        max: 80,
        category: 'Feature',
        priority: 'required',
      },
      {
        id: 'm3-drivers',
        title: 'Driver management',
        description: 'Водії, привʼязка до перевізника, контакти.',
        min: 40,
        max: 65,
        category: 'Feature',
        priority: 'required',
      },
      {
        id: 'm3-finance',
        title: 'Carrier finance view',
        description: 'Базова фінансова видимість перевізника.',
        min: 25,
        max: 45,
        category: 'Feature',
        priority: 'recommended',
        consequence: 'Перевізник не бачитиме базову фінансову історію в MVP.',
      },
      {
        id: 'm3-docs',
        title: 'Carrier documents',
        description: 'Базові документи компанії/авто/водія.',
        min: 30,
        max: 50,
        category: 'Feature',
        priority: 'recommended',
        consequence: 'Перевірка документів перевізника залишиться ручним процесом.',
      },
      {
        id: 'm3-qa',
        title: 'QA',
        description: 'Isolation, validation, базові permissions.',
        min: 30,
        max: 50,
        category: 'QA',
        priority: 'required',
      },
    ],
  },
  {
    id: 'm4',
    title: 'Milestone 4 — Matching & atomic accept',
    killerFeature:
      'Заявка доходить до релевантних перевізників і може бути прийнята без подвійного призначення.',
    blocks: [
      {
        id: 'm4-rules',
        title: 'Matching rules',
        description: 'Тип ТЗ, тоннаж, напрямок, активність.',
        min: 45,
        max: 70,
        category: 'Architecture',
        priority: 'required',
      },
      {
        id: 'm4-geo-rating',
        title: 'Geo/rating matching refinements',
        description: 'Географія, рейтинг і уточнення релевантності перевізників.',
        min: 20,
        max: 35,
        category: 'Architecture',
        priority: 'recommended',
        consequence: 'Matching буде простішим: без тонкого рейтингу/географії, більше ручного контролю з боку Grandar.',
      },
      {
        id: 'm4-distribution',
        title: 'Request distribution',
        description: 'Розсилка релевантним перевізникам.',
        min: 40,
        max: 65,
        category: 'Architecture',
        priority: 'required',
      },
      {
        id: 'm4-notifications',
        title: 'Web/push notifications',
        description: 'Базові web notifications для перевізників.',
        min: 25,
        max: 40,
        category: 'Feature',
        priority: 'required',
      },
      {
        id: 'm4-repeat-notifications',
        title: 'Repeated notification rules',
        description: 'Повторні повідомлення через заданий час.',
        min: 15,
        max: 25,
        category: 'Feature',
        priority: 'recommended',
        consequence: 'Якщо перевізник не реагує, повторні нагадування доведеться робити вручну або додати після MVP.',
      },
      {
        id: 'm4-atomic',
        title: 'Atomic accept',
        description: 'Server-side lock, race condition handling.',
        min: 55,
        max: 85,
        category: 'Architecture',
        priority: 'required',
      },
      {
        id: 'm4-ux',
        title: 'Carrier accept/decline UX',
        description: 'Прийняти заявку, призначити авто/водія.',
        min: 40,
        max: 65,
        category: 'Feature',
        priority: 'required',
      },
      {
        id: 'm4-decline-reason',
        title: 'Decline reason flow',
        description: 'Відмова від заявки з причиною.',
        min: 15,
        max: 25,
        category: 'Feature',
        priority: 'recommended',
        consequence: 'Відмови перевізників будуть менш структурованими; причини доведеться збирати вручну.',
      },
      {
        id: 'm4-qa',
        title: 'QA',
        description: 'Concurrency, matching, notification tests.',
        min: 45,
        max: 70,
        category: 'QA',
        priority: 'required',
      },
    ],
  },
  {
    id: 'm5',
    title: 'Milestone 5 — Driver app',
    killerFeature:
      'Водій бачить призначені рейси, передає GPS для Grandar і завантажує фото/документи по рейсу.',
    blocks: [
      {
        id: 'm5-foundation',
        title: 'Driver app foundation',
        description: 'React Native app, login, tabbar/navigation, API integration.',
        min: 50,
        max: 80,
        category: 'Mobile',
        priority: 'required',
      },
      {
        id: 'm5-profile',
        title: 'Driver profile',
        description: 'Профіль водія, компанія, авто, permissions status.',
        min: 20,
        max: 35,
        category: 'Mobile',
        priority: 'recommended',
        consequence: 'Профіль і стан дозволів доведеться перевіряти через підтримку або оператора.',
      },
      {
        id: 'm5-trips',
        title: 'Trip list & details',
        description: 'Список рейсів, точки, вантаж, контакти, авто, статус.',
        min: 40,
        max: 65,
        category: 'Mobile',
        priority: 'required',
      },
      {
        id: 'm5-gps',
        title: 'GPS tracking',
        description: 'Background location для Grandar, permission handling, GPS status.',
        min: 65,
        max: 105,
        category: 'Mobile',
        priority: 'required',
      },
      {
        id: 'm5-docs',
        title: 'Documents/photos',
        description: 'Камера, upload фото/сканів, привʼязка до рейсу.',
        min: 50,
        max: 80,
        category: 'Mobile',
        priority: 'required',
      },
      {
        id: 'm5-statuses',
        title: 'Basic trip statuses',
        description: 'Мінімальні статуси рейсу.',
        min: 25,
        max: 45,
        category: 'Mobile',
        priority: 'recommended',
        consequence: 'Водій бачитиме рейс, GPS і документи, але частину статусів доведеться вести оператору Grandar.',
      },
      {
        id: 'm5-push',
        title: 'Push notifications',
        description: 'Призначення рейсу, нагадування, відкриття потрібного екрана в app.',
        min: 35,
        max: 60,
        category: 'Mobile',
        priority: 'required',
      },
      {
        id: 'm5-qa',
        title: 'QA',
        description: 'Mobile QA, GPS/upload tests, базові device checks.',
        min: 50,
        max: 80,
        category: 'QA',
        priority: 'required',
      },
    ],
  },
  {
    id: 'm6',
    title: 'Milestone 6 — Grandar operations & finance',
    killerFeature:
      'Grandar бачить рейси, статуси, документи, GPS tracking і базову фінансову маржу.',
    blocks: [
      {
        id: 'm6-dashboard',
        title: 'Operations dashboard',
        description: 'Активні рейси, статуси, базовий GPS view.',
        min: 50,
        max: 80,
        category: 'Feature',
        priority: 'required',
      },
      {
        id: 'm6-exceptions',
        title: 'Exceptions queue',
        description: 'Окрема черга винятків і проблемних рейсів.',
        min: 20,
        max: 35,
        category: 'Feature',
        priority: 'recommended',
        consequence: 'Винятки будуть видимі в загальних списках, але без окремої операційної черги.',
      },
      {
        id: 'm6-trip',
        title: 'Trip detail for Grandar',
        description: 'Учасники, timeline, документи, GPS, фінансовий статус.',
        min: 50,
        max: 80,
        category: 'Feature',
        priority: 'required',
      },
      {
        id: 'm6-docs',
        title: 'Document workspace',
        description: 'Список документів рейсу.',
        min: 35,
        max: 55,
        category: 'Feature',
        priority: 'required',
      },
      {
        id: 'm6-doc-statuses',
        title: 'Document status workflow',
        description: 'Missing/approved statuses і ручна перевірка документів.',
        min: 20,
        max: 35,
        category: 'Feature',
        priority: 'recommended',
        consequence: 'Документи будуть збережені по рейсу, але без повного статусного workflow перевірки.',
      },
      {
        id: 'm6-finance',
        title: 'Finance core',
        description: 'Ціна вантажовласника, ціна перевізника, маржа, валюти.',
        min: 70,
        max: 115,
        category: 'Feature',
        priority: 'required',
      },
      {
        id: 'm6-reporting',
        title: 'Basic reporting',
        description: 'Базові exports і фільтри.',
        min: 35,
        max: 60,
        category: 'Feature',
        priority: 'recommended',
        consequence: 'Звіти для операцій і фінансів доведеться збирати вручну з таблиць або базових exports.',
      },
      {
        id: 'm6-qa',
        title: 'QA',
        description: 'Permissions, finance visibility, document access.',
        min: 45,
        max: 70,
        category: 'QA',
        priority: 'required',
      },
    ],
  },
  {
    id: 'm7',
    title: 'Milestone 7 — Migration, integrations, beta launch',
    killerFeature:
      'MVP готовий до beta launch з першими компаніями, базовими даними й мінімальним інтеграційним контуром.',
    blocks: [
      {
        id: 'm7-sheets',
        title: 'Google Sheets migration',
        description: 'Mapping, мінімальний import, validation.',
        min: 40,
        max: 75,
        category: 'Integration',
        priority: 'required',
      },
      {
        id: 'm7-medoc',
        title: 'M.E.Doc baseline',
        description: 'Погоджений формат export/import або manual-assisted workflow.',
        min: 45,
        max: 90,
        category: 'Integration',
        priority: 'recommended',
        consequence: 'Бухгалтерський документообіг залишиться ручним на перший beta запуск.',
      },
      {
        id: 'm7-bas',
        title: '1C/BAS baseline',
        description: 'Мінімальний export/import реєстрів.',
        min: 45,
        max: 90,
        category: 'Integration',
        priority: 'required',
      },
      {
        id: 'm7-hardening',
        title: 'Beta hardening',
        description: 'Bug fixing, release checklist, monitoring basics.',
        min: 65,
        max: 110,
        category: 'Architecture',
        priority: 'required',
      },
      {
        id: 'm7-uat',
        title: 'UAT support',
        description: 'Тестування з Grandar, fixes, launch notes.',
        min: 45,
        max: 75,
        category: 'QA',
        priority: 'required',
      },
      {
        id: 'm7-regression',
        title: 'QA regression',
        description: 'Critical MVP regression pass.',
        min: 60,
        max: 95,
        category: 'QA',
        priority: 'required',
      },
    ],
  },
]

const categoryLabels: Record<Category, string> = {
  Architecture: 'Architecture',
  Feature: 'Product features',
  QA: 'QA & UAT',
  Integration: 'Integrations',
  Mobile: 'Mobile app',
}

const priorityLabels: Record<Priority, string> = {
  required: 'Required',
  recommended: 'Recommended',
  optional: 'Optional',
}

const allBlocks = milestones.flatMap((milestone) =>
  milestone.blocks.map((block) => ({ ...block, milestone: milestone.title })),
)

const initialSelected = Object.fromEntries(allBlocks.map((block) => [block.id, true]))

function formatHours(min: number, max: number) {
  return `${min.toLocaleString('en-US')}-${max.toLocaleString('en-US')} h`
}

function formatMonthRange(min: number, max: number) {
  const low = (min / 320).toFixed(1)
  const high = (max / 320).toFixed(1)
  return `${low}-${high} mo`
}

function wrapText(doc: jsPDF, value: string, maxWidth: number) {
  return doc.splitTextToSize(value, maxWidth) as string[]
}

function App() {
  const [selected, setSelected] = useState<Record<string, boolean>>(initialSelected)
  const [activeMilestone, setActiveMilestone] = useState('all')
  const [showOnlyRemovable, setShowOnlyRemovable] = useState(false)

  const visibleMilestones = useMemo(() => {
    if (activeMilestone === 'all') return milestones
    return milestones.filter((milestone) => milestone.id === activeMilestone)
  }, [activeMilestone])

  const totals = useMemo(() => {
    const picked = allBlocks.filter((block) => selected[block.id])
    const removed = allBlocks.filter((block) => !selected[block.id])
    const min = picked.reduce((sum, block) => sum + block.min, 0)
    const max = picked.reduce((sum, block) => sum + block.max, 0)
    const breakdown = picked.reduce(
      (acc, block) => {
        acc[block.category].min += block.min
        acc[block.category].max += block.max
        return acc
      },
      {
        Architecture: { min: 0, max: 0 },
        Feature: { min: 0, max: 0 },
        QA: { min: 0, max: 0 },
        Integration: { min: 0, max: 0 },
        Mobile: { min: 0, max: 0 },
      } satisfies Record<Category, { min: number; max: number }>,
    )

    return { picked, removed, min, max, breakdown }
  }, [selected])

  const removedWarnings = totals.removed.filter((block) => block.consequence)
  const maxCategory = Math.max(
    ...Object.values(totals.breakdown).map((item) => item.max),
    1,
  )

  function toggleBlock(block: WorkBlock) {
    if (block.priority === 'required') return
    setSelected((current) => ({ ...current, [block.id]: !current[block.id] }))
  }

  function resetRecommended() {
    setSelected(initialSelected)
  }

  function selectLeanMvp() {
    setSelected(
      Object.fromEntries(
        allBlocks.map((block) => [block.id, block.priority === 'required']),
      ),
    )
  }

  async function copySummary() {
    const text = [
      'Grandar MVP Scope Calculator',
      `Selected effort: ${formatHours(totals.min, totals.max)}`,
      `Calendar with 2 Senior Full-stack Developers: ${formatMonthRange(totals.min, totals.max)}`,
      '',
      'Selected scope:',
      ...totals.picked.map((block) => `- ${block.title}: ${formatHours(block.min, block.max)}`),
    ].join('\n')
    await navigator.clipboard.writeText(text)
  }

  function exportPdf() {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 44
    const contentWidth = pageWidth - margin * 2
    let y = margin

    const ensureSpace = (height: number) => {
      if (y + height <= pageHeight - margin) return
      doc.addPage()
      y = margin
    }

    const addText = (
      value: string,
      size = 10,
      style: 'normal' | 'bold' = 'normal',
      color: [number, number, number] = [17, 24, 39],
      lineGap = 4,
      width = contentWidth,
    ) => {
      doc.setFont('helvetica', style)
      doc.setFontSize(size)
      doc.setTextColor(...color)
      const lines = wrapText(doc, value, width)
      ensureSpace(lines.length * (size + lineGap) + 2)
      doc.text(lines, margin, y)
      y += lines.length * (size + lineGap)
    }

    const addSectionTitle = (value: string) => {
      y += 10
      ensureSpace(30)
      doc.setFillColor(227, 6, 19)
      doc.rect(margin, y - 6, 4, 22, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.setTextColor(17, 24, 39)
      doc.text(value, margin + 12, y + 9)
      y += 28
    }

    doc.setFillColor(227, 6, 19)
    doc.roundedRect(margin, y, 34, 34, 8, 8, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(17)
    doc.text('G', margin + 12, y + 23)
    doc.setTextColor(17, 24, 39)
    doc.setFontSize(18)
    doc.text('Grandar MVP Scope Selection', margin + 48, y + 15)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(102, 112, 133)
    doc.text(`Generated ${new Date().toLocaleDateString('en-GB')}`, margin + 48, y + 31)
    y += 62

    doc.setFillColor(17, 24, 39)
    doc.roundedRect(margin, y, contentWidth, 86, 12, 12, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(24)
    doc.text(formatHours(totals.min, totals.max), margin + 22, y + 35)
    doc.setFontSize(11)
    doc.setTextColor(213, 219, 229)
    doc.text('Selected MVP effort', margin + 22, y + 58)
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.text(formatMonthRange(totals.min, totals.max), margin + 300, y + 35)
    doc.setTextColor(213, 219, 229)
    doc.setFontSize(11)
    doc.text('Calendar with 2 Senior Full-stack Developers', margin + 300, y + 58)
    y += 112

    addText(
      'This PDF reflects the scope configuration selected in the guided calculator. Required blocks are treated as locked MVP logic. Removed recommended blocks are listed with their expected impact.',
      10,
      'normal',
      [71, 84, 103],
      4,
    )

    addSectionTitle('Breakdown by work type')
    ;(Object.keys(categoryLabels) as Category[]).forEach((category) => {
      const item = totals.breakdown[category]
      addText(`${categoryLabels[category]}: ${formatHours(item.min, item.max)}`, 10, 'bold')
    })

    addSectionTitle('Selected scope')
    milestones.forEach((milestone) => {
      const pickedBlocks = milestone.blocks.filter((block) => selected[block.id])
      if (pickedBlocks.length === 0) return
      const milestoneMin = pickedBlocks.reduce((sum, block) => sum + block.min, 0)
      const milestoneMax = pickedBlocks.reduce((sum, block) => sum + block.max, 0)
      ensureSpace(54)
      addText(`${milestone.title} — ${formatHours(milestoneMin, milestoneMax)}`, 12, 'bold')
      addText(milestone.killerFeature, 9, 'normal', [102, 112, 133])
      pickedBlocks.forEach((block) => {
        addText(
          `• ${block.title}: ${formatHours(block.min, block.max)} | ${categoryLabels[block.category]} | ${priorityLabels[block.priority]}`,
          9,
          'normal',
          [17, 24, 39],
        )
      })
      y += 4
    })

    addSectionTitle('Removed impact')
    if (removedWarnings.length === 0) {
      addText('Recommended MVP scope is intact. No recommended blocks were removed.', 10)
    } else {
      removedWarnings.forEach((block) => {
        addText(`${block.title}`, 10, 'bold')
        addText(block.consequence ?? '', 9, 'normal', [102, 112, 133])
      })
    }

    addSectionTitle('Assumptions')
    addText('1 full-time developer ≈ 160 h/month.', 10)
    addText('2 Senior Full-stack Developers ≈ 320 h/month.', 10)
    addText('Calendar can shift with UAT, integration access, feedback cycles, and scope changes.', 10)

    doc.save('grandar-mvp-scope-selection.pdf')
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">G</div>
          <div>
            <p className="eyeline">Koitechs discovery tool</p>
            <h1>Grandar MVP Scope Calculator</h1>
          </div>
        </div>
        <div className="topbar-actions">
          <button className="ghost-button" type="button" onClick={selectLeanMvp}>
            Lean MVP
          </button>
          <button className="ghost-button" type="button" onClick={resetRecommended}>
            Recommended
          </button>
          <button className="primary-button" type="button" onClick={copySummary}>
            Copy summary
          </button>
          <button className="primary-button export-button" type="button" onClick={exportPdf}>
            Export PDF
          </button>
        </div>
      </header>

      <section className="hero-panel">
        <div>
          <p className="section-label">Guided estimator</p>
          <h2>Choose scope without breaking the MVP logic.</h2>
          <p>
            Required blocks stay locked. Recommended blocks can be removed, but the
            calculator shows what risk or manual fallback this creates.
          </p>
        </div>
        <div className="hero-stats" aria-label="Current estimate">
          <div>
            <span>Total effort</span>
            <strong>{formatHours(totals.min, totals.max)}</strong>
          </div>
          <div>
            <span>2 senior devs</span>
            <strong>{formatMonthRange(totals.min, totals.max)}</strong>
          </div>
          <div>
            <span>Selected blocks</span>
            <strong>{totals.picked.length}/{allBlocks.length}</strong>
          </div>
        </div>
      </section>

      <nav className="milestone-nav" aria-label="Milestone filters">
        <button
          className={activeMilestone === 'all' ? 'active' : ''}
          type="button"
          onClick={() => setActiveMilestone('all')}
        >
          All milestones
        </button>
        {milestones.map((milestone, index) => (
          <button
            className={activeMilestone === milestone.id ? 'active' : ''}
            key={milestone.id}
            type="button"
            onClick={() => setActiveMilestone(milestone.id)}
          >
            M{index + 1}
          </button>
        ))}
      </nav>

      <div className="workspace">
        <section className="milestone-list" aria-label="Milestone work blocks">
          <div className="list-toolbar">
            <div>
              <p className="section-label">MVP milestones</p>
              <h2>Scope blocks</h2>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={showOnlyRemovable}
                onChange={(event) => setShowOnlyRemovable(event.target.checked)}
              />
              Show removable only
            </label>
          </div>

          {visibleMilestones.map((milestone) => {
            const blocks = showOnlyRemovable
              ? milestone.blocks.filter((block) => block.priority !== 'required')
              : milestone.blocks
            const milestoneMin = milestone.blocks
              .filter((block) => selected[block.id])
              .reduce((sum, block) => sum + block.min, 0)
            const milestoneMax = milestone.blocks
              .filter((block) => selected[block.id])
              .reduce((sum, block) => sum + block.max, 0)

            return (
              <article className="milestone-card" key={milestone.id}>
                <div className="milestone-card-header">
                  <div>
                    <h3>{milestone.title}</h3>
                    <p>{milestone.killerFeature}</p>
                  </div>
                  <span className="hours-pill">{formatHours(milestoneMin, milestoneMax)}</span>
                </div>

                <div className="block-list">
                  {blocks.map((block) => {
                    const isSelected = selected[block.id]
                    const isLocked = block.priority === 'required'

                    return (
                      <button
                        className={`work-block ${isSelected ? 'selected' : 'removed'} ${
                          isLocked ? 'locked' : ''
                        }`}
                        key={block.id}
                        type="button"
                        onClick={() => toggleBlock(block)}
                      >
                        <span className="check" aria-hidden="true">
                          {isLocked ? 'L' : isSelected ? '✓' : ''}
                        </span>
                        <span className="block-main">
                          <span className="block-title-row">
                            <strong>{block.title}</strong>
                            <span className={`priority ${block.priority}`}>
                              {priorityLabels[block.priority]}
                            </span>
                          </span>
                          <span>{block.description}</span>
                        </span>
                        <span className={`category ${block.category.toLowerCase()}`}>
                          {categoryLabels[block.category]}
                        </span>
                        <span className="block-hours">{formatHours(block.min, block.max)}</span>
                      </button>
                    )
                  })}
                </div>
              </article>
            )
          })}
        </section>

        <aside className="summary-panel" aria-label="Estimate summary">
          <div className="summary-card total-card">
            <p className="section-label">Selected estimate</p>
            <strong>{formatHours(totals.min, totals.max)}</strong>
            <span>{formatMonthRange(totals.min, totals.max)} with 2 senior full-stack developers</span>
          </div>

          <div className="summary-card">
            <div className="summary-heading">
              <h3>Breakdown</h3>
              <span>hours by work type</span>
            </div>
            <div className="breakdown-list">
              {(Object.keys(categoryLabels) as Category[]).map((category) => {
                const item = totals.breakdown[category]
                const width = Math.max(4, (item.max / maxCategory) * 100)
                return (
                  <div className="breakdown-row" key={category}>
                    <div>
                      <span>{categoryLabels[category]}</span>
                      <strong>{formatHours(item.min, item.max)}</strong>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${width}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-heading">
              <h3>Removed impact</h3>
              <span>{removedWarnings.length} warning(s)</span>
            </div>
            {removedWarnings.length === 0 ? (
              <p className="empty-state">Recommended MVP scope is intact.</p>
            ) : (
              <ul className="warning-list">
                {removedWarnings.map((block) => (
                  <li key={block.id}>
                    <strong>{block.title}</strong>
                    <span>{block.consequence}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="summary-card assumptions">
            <h3>Assumptions</h3>
            <p>1 full-time developer ≈ 160 h/month.</p>
            <p>2 Senior Full-stack Developers ≈ 320 h/month.</p>
            <p>Calendar can shift with UAT, integration access, and scope changes.</p>
          </div>
        </aside>
      </div>
    </main>
  )
}

export default App
