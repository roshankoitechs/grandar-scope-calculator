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
    title: 'Майлстоун 1 — Фундамент платформи',
    killerFeature:
      'У системі можна створювати організації, користувачів і базові ролі з ізоляцією даних.',
    blocks: [
      {
        id: 'm1-auth',
        title: 'Авторизація та сесії',
        description: 'Вхід у систему, відновлення пароля, керування сесією.',
        min: 35,
        max: 55,
        category: 'Architecture',
        priority: 'required',
      },
      {
        id: 'm1-orgs',
        title: 'Модель організацій',
        description: 'Вантажовласники, перевізники, внутрішня організація Grandar.',
        min: 35,
        max: 55,
        category: 'Architecture',
        priority: 'required',
      },
      {
        id: 'm1-rbac',
        title: 'Рольовий доступ',
        description: 'Базові ролі та права доступу для MVP.',
        min: 50,
        max: 75,
        category: 'Architecture',
        priority: 'required',
      },
      {
        id: 'm1-admin',
        title: 'Базове адміністрування',
        description: 'Створення/редагування компаній і користувачів.',
        min: 50,
        max: 75,
        category: 'Feature',
        priority: 'required',
      },
      {
        id: 'm1-blocking',
        title: 'Блокування та статус верифікації компаній',
        description: 'Блокування компаній, базовий статус верифікації.',
        min: 18,
        max: 30,
        category: 'Feature',
        priority: 'recommended',
        consequence: 'Компанії можна буде заводити, але блокування/верифікаційні статуси доведеться контролювати вручну.',
      },
      {
        id: 'm1-audit',
        title: 'Базовий аудит',
        description: 'Логування тільки критичних дій MVP.',
        min: 20,
        max: 35,
        category: 'Architecture',
        priority: 'recommended',
        consequence: 'Менше прозорості щодо того, хто змінив заявку, доступи або фінансові дані.',
      },
      {
        id: 'm1-qa',
        title: 'Тестування',
        description: 'Перевірка ролей, доступів і базових негативних сценаріїв.',
        min: 30,
        max: 45,
        category: 'QA',
        priority: 'required',
      },
    ],
  },
  {
    id: 'm2',
    title: 'Майлстоун 2 — Онбординг вантажовласника та заявка',
    killerFeature:
      'Вантажовласник може створити заявку, зберегти її як чернетку й опублікувати для підбору перевізника.',
    blocks: [
      {
        id: 'm2-portal',
        title: 'Кабінет вантажовласника',
        description: 'Список заявок, статуси, базовий профіль компанії.',
        min: 45,
        max: 70,
        category: 'Feature',
        priority: 'required',
      },
      {
        id: 'm2-form',
        title: 'Форма заявки на перевезення',
        description: 'Маршрут, базові точки, вантаж, вимоги до ТЗ, контакти.',
        min: 55,
        max: 85,
        category: 'Feature',
        priority: 'required',
      },
      {
        id: 'm2-multipoint',
        title: 'Розширений мультиточковий маршрут',
        description: 'Декілька додаткових точок маршруту й складні сценарії валідації.',
        min: 20,
        max: 35,
        category: 'Feature',
        priority: 'recommended',
        consequence: 'MVP стартує з простішим маршрутом; складні мультиточкові сценарії доведеться вести вручну або додати пізніше.',
      },
      {
        id: 'm2-pricing',
        title: 'Введення ціни',
        description: 'Ціна, валюта, базова видимість.',
        min: 20,
        max: 35,
        category: 'Feature',
        priority: 'required',
      },
      {
        id: 'm2-attachments',
        title: 'Вкладення',
        description: 'Базові вкладення до заявки.',
        min: 25,
        max: 45,
        category: 'Feature',
        priority: 'recommended',
        consequence: 'Документи до заявки доведеться передавати поза платформою до етапу рейсу.',
      },
      {
        id: 'm2-draft',
        title: 'Чернетка та публікація',
        description: 'Чернетка, публікація, валідація.',
        min: 30,
        max: 50,
        category: 'Feature',
        priority: 'required',
      },
      {
        id: 'm2-qa',
        title: 'Тестування',
        description: 'Валідація, видимість даних і базові складні сценарії.',
        min: 30,
        max: 50,
        category: 'QA',
        priority: 'required',
      },
    ],
  },
  {
    id: 'm3',
    title: 'Майлстоун 3 — Онбординг перевізника',
    killerFeature:
      'Перевізник може бути заведений у систему, додати авто/водіїв і бути готовим приймати заявки.',
    blocks: [
      {
        id: 'm3-portal',
        title: 'Кабінет перевізника',
        description: 'Профіль перевізника, користувачі, статус.',
        min: 40,
        max: 65,
        category: 'Feature',
        priority: 'required',
      },
      {
        id: 'm3-carrier-users',
        title: 'Керування користувачами перевізника',
        description: 'Користувачі перевізника, базове редагування доступів.',
        min: 18,
        max: 30,
        category: 'Feature',
        priority: 'recommended',
        consequence: 'Користувачів перевізника доведеться додавати через адміністратора Grandar.',
      },
      {
        id: 'm3-fleet',
        title: 'Керування автопарком',
        description: 'Авто, тип ТЗ, тоннаж, активність.',
        min: 50,
        max: 80,
        category: 'Feature',
        priority: 'required',
      },
      {
        id: 'm3-drivers',
        title: 'Керування водіями',
        description: 'Водії, привʼязка до перевізника, контакти.',
        min: 40,
        max: 65,
        category: 'Feature',
        priority: 'required',
      },
      {
        id: 'm3-finance',
        title: 'Фінансова видимість перевізника',
        description: 'Базова фінансова видимість перевізника.',
        min: 25,
        max: 45,
        category: 'Feature',
        priority: 'recommended',
        consequence: 'Перевізник не бачитиме базову фінансову історію в MVP.',
      },
      {
        id: 'm3-docs',
        title: 'Документи перевізника',
        description: 'Базові документи компанії/авто/водія.',
        min: 30,
        max: 50,
        category: 'Feature',
        priority: 'recommended',
        consequence: 'Перевірка документів перевізника залишиться ручним процесом.',
      },
      {
        id: 'm3-qa',
        title: 'Тестування',
        description: 'Ізоляція даних, валідація та базові права доступу.',
        min: 30,
        max: 50,
        category: 'QA',
        priority: 'required',
      },
    ],
  },
  {
    id: 'm4',
    title: 'Майлстоун 4 — Підбір перевізника та атомарне прийняття',
    killerFeature:
      'Заявка доходить до релевантних перевізників і може бути прийнята без подвійного призначення.',
    blocks: [
      {
        id: 'm4-rules',
        title: 'Правила підбору перевізників',
        description: 'Тип ТЗ, тоннаж, напрямок, активність.',
        min: 45,
        max: 70,
        category: 'Architecture',
        priority: 'required',
      },
      {
        id: 'm4-geo-rating',
        title: 'Уточнення підбору за географією та рейтингом',
        description: 'Географія, рейтинг і уточнення релевантності перевізників.',
        min: 20,
        max: 35,
        category: 'Architecture',
        priority: 'recommended',
        consequence: 'Підбір буде простішим: без тонкого рейтингу/географії, більше ручного контролю з боку Grandar.',
      },
      {
        id: 'm4-distribution',
        title: 'Розсилка заявки',
        description: 'Розсилка релевантним перевізникам.',
        min: 40,
        max: 65,
        category: 'Architecture',
        priority: 'required',
      },
      {
        id: 'm4-notifications',
        title: 'Веб- і push-нотифікації',
        description: 'Базові веб-нотифікації для перевізників.',
        min: 25,
        max: 40,
        category: 'Feature',
        priority: 'required',
      },
      {
        id: 'm4-repeat-notifications',
        title: 'Правила повторних повідомлень',
        description: 'Повторні повідомлення через заданий час.',
        min: 15,
        max: 25,
        category: 'Feature',
        priority: 'recommended',
        consequence: 'Якщо перевізник не реагує, повторні нагадування доведеться робити вручну або додати після MVP.',
      },
      {
        id: 'm4-atomic',
        title: 'Атомарне прийняття',
        description: 'Серверне блокування та обробка одночасних прийнять.',
        min: 55,
        max: 85,
        category: 'Architecture',
        priority: 'required',
      },
      {
        id: 'm4-ux',
        title: 'UX прийняття заявки перевізником',
        description: 'Прийняти заявку, призначити авто/водія.',
        min: 40,
        max: 65,
        category: 'Feature',
        priority: 'required',
      },
      {
        id: 'm4-decline-reason',
        title: 'Причина відмови від заявки',
        description: 'Відмова від заявки з причиною.',
        min: 15,
        max: 25,
        category: 'Feature',
        priority: 'recommended',
        consequence: 'Відмови перевізників будуть менш структурованими; причини доведеться збирати вручну.',
      },
      {
        id: 'm4-qa',
        title: 'Тестування',
        description: 'Перевірка одночасних дій, підбору перевізників і нотифікацій.',
        min: 45,
        max: 70,
        category: 'QA',
        priority: 'required',
      },
    ],
  },
  {
    id: 'm5',
    title: 'Майлстоун 5 — Застосунок водія',
    killerFeature:
      'Водій бачить призначені рейси, передає GPS для Grandar і завантажує фото/документи по рейсу.',
    blocks: [
      {
        id: 'm5-foundation',
        title: 'Фундамент застосунку водія',
        description: 'React Native застосунок, вхід у систему, нижня навігація, API-інтеграція.',
        min: 50,
        max: 80,
        category: 'Mobile',
        priority: 'required',
      },
      {
        id: 'm5-profile',
        title: 'Профіль водія',
        description: 'Профіль водія, компанія, авто, статус дозволів застосунку.',
        min: 20,
        max: 35,
        category: 'Mobile',
        priority: 'recommended',
        consequence: 'Профіль і стан дозволів доведеться перевіряти через підтримку або оператора.',
      },
      {
        id: 'm5-trips',
        title: 'Список і деталі рейсів',
        description: 'Список рейсів, точки, вантаж, контакти, авто, статус.',
        min: 40,
        max: 65,
        category: 'Mobile',
        priority: 'required',
      },
      {
        id: 'm5-gps',
        title: 'GPS-відстеження',
        description: 'Фонове відстеження для Grandar, обробка дозволів, статус GPS.',
        min: 65,
        max: 105,
        category: 'Mobile',
        priority: 'required',
      },
      {
        id: 'm5-docs',
        title: 'Документи та фото',
        description: 'Камера, завантаження фото/сканів, привʼязка до рейсу.',
        min: 50,
        max: 80,
        category: 'Mobile',
        priority: 'required',
      },
      {
        id: 'm5-statuses',
        title: 'Базові статуси рейсу',
        description: 'Мінімальні статуси рейсу.',
        min: 25,
        max: 45,
        category: 'Mobile',
        priority: 'recommended',
        consequence: 'Водій бачитиме рейс, GPS і документи, але частину статусів доведеться вести оператору Grandar.',
      },
      {
        id: 'm5-push',
        title: 'Push-нотифікації',
        description: 'Призначення рейсу, нагадування, відкриття потрібного екрана в застосунку.',
        min: 35,
        max: 60,
        category: 'Mobile',
        priority: 'required',
      },
      {
        id: 'm5-qa',
        title: 'Тестування',
        description: 'Мобільне тестування, перевірка GPS/завантажень і базові перевірки пристроїв.',
        min: 50,
        max: 80,
        category: 'QA',
        priority: 'required',
      },
    ],
  },
  {
    id: 'm6',
    title: 'Майлстоун 6 — Операції та фінанси Grandar',
    killerFeature:
      'Grandar бачить рейси, статуси, документи, GPS-відстеження і базову фінансову маржу.',
    blocks: [
      {
        id: 'm6-dashboard',
        title: 'Операційний дашборд',
        description: 'Активні рейси, статуси, базовий перегляд GPS.',
        min: 50,
        max: 80,
        category: 'Feature',
        priority: 'required',
      },
      {
        id: 'm6-exceptions',
        title: 'Черга винятків',
        description: 'Окрема черга винятків і проблемних рейсів.',
        min: 20,
        max: 35,
        category: 'Feature',
        priority: 'recommended',
        consequence: 'Винятки будуть видимі в загальних списках, але без окремої операційної черги.',
      },
      {
        id: 'm6-trip',
        title: 'Картка рейсу для Grandar',
        description: 'Учасники, хронологія, документи, GPS, фінансовий статус.',
        min: 50,
        max: 80,
        category: 'Feature',
        priority: 'required',
      },
      {
        id: 'm6-docs',
        title: 'Робоча зона документів',
        description: 'Список документів рейсу.',
        min: 35,
        max: 55,
        category: 'Feature',
        priority: 'required',
      },
      {
        id: 'm6-doc-statuses',
        title: 'Статусний процес документів',
        description: 'Статуси відсутніх/підтверджених документів і ручна перевірка.',
        min: 20,
        max: 35,
        category: 'Feature',
        priority: 'recommended',
        consequence: 'Документи будуть збережені по рейсу, але без повного статусного процесу перевірки.',
      },
      {
        id: 'm6-finance',
        title: 'Фінансове ядро',
        description: 'Ціна вантажовласника, ціна перевізника, маржа, валюти.',
        min: 70,
        max: 115,
        category: 'Feature',
        priority: 'required',
      },
      {
        id: 'm6-reporting',
        title: 'Базова звітність',
        description: 'Базові експорти та фільтри.',
        min: 35,
        max: 60,
        category: 'Feature',
        priority: 'recommended',
        consequence: 'Звіти для операцій і фінансів доведеться збирати вручну з таблиць або базових експортів.',
      },
      {
        id: 'm6-qa',
        title: 'Тестування',
        description: 'Права доступу, фінансова видимість і доступ до документів.',
        min: 45,
        max: 70,
        category: 'QA',
        priority: 'required',
      },
    ],
  },
  {
    id: 'm7',
    title: 'Майлстоун 7 — Міграція, інтеграції та бета-запуск',
    killerFeature:
      'MVP готовий до бета-запуску з першими компаніями, базовими даними й мінімальним інтеграційним контуром.',
    blocks: [
      {
        id: 'm7-sheets',
        title: 'Міграція з Google Sheets',
        description: 'Мапінг, мінімальний імпорт, валідація.',
        min: 40,
        max: 75,
        category: 'Integration',
        priority: 'required',
      },
      {
        id: 'm7-medoc',
        title: 'Базовий контур M.E.Doc',
        description: 'Погоджений формат експорту/імпорту або напівручний процес.',
        min: 45,
        max: 90,
        category: 'Integration',
        priority: 'recommended',
        consequence: 'Бухгалтерський документообіг залишиться ручним на перший бета-запуск.',
      },
      {
        id: 'm7-bas',
        title: 'Базовий контур 1C/BAS',
        description: 'Мінімальний експорт/імпорт реєстрів.',
        min: 45,
        max: 90,
        category: 'Integration',
        priority: 'required',
      },
      {
        id: 'm7-hardening',
        title: 'Підготовка до бета-запуску',
        description: 'Виправлення помилок, чеклист релізу, базовий моніторинг.',
        min: 65,
        max: 110,
        category: 'Architecture',
        priority: 'required',
      },
      {
        id: 'm7-uat',
        title: 'Підтримка приймального тестування',
        description: 'Тестування з Grandar, виправлення, нотатки до запуску.',
        min: 45,
        max: 75,
        category: 'QA',
        priority: 'required',
      },
      {
        id: 'm7-regression',
        title: 'Регресійне тестування',
        description: 'Критична регресійна перевірка MVP.',
        min: 60,
        max: 95,
        category: 'QA',
        priority: 'required',
      },
    ],
  },
]

const categoryLabels: Record<Category, string> = {
  Architecture: 'Архітектура',
  Feature: 'Продуктові функції',
  QA: 'Тестування та приймання',
  Integration: 'Інтеграції',
  Mobile: 'Мобільний застосунок',
}

const priorityLabels: Record<Priority, string> = {
  required: 'Обовʼязково',
  recommended: 'Можна урізати',
  optional: 'Опційно',
}

const allBlocks = milestones.flatMap((milestone) =>
  milestone.blocks.map((block) => ({ ...block, milestone: milestone.title })),
)

const initialSelected = Object.fromEntries(allBlocks.map((block) => [block.id, true]))

function formatHours(min: number, max: number) {
  return `${min.toLocaleString('uk-UA')}-${max.toLocaleString('uk-UA')} год`
}

function formatMonthRange(min: number, max: number) {
  const low = (min / 320).toFixed(1)
  const high = (max / 320).toFixed(1)
  return `${low}-${high} міс.`
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

  function resetRecommendedScope() {
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
      'Grandar MVP калькулятор обсягу',
      `Обрана оцінка: ${formatHours(totals.min, totals.max)}`,
      `Календар з 2 сеньйор full-stack розробниками: ${formatMonthRange(totals.min, totals.max)}`,
      '',
      'Обраний обсяг:',
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
    doc.text('Grandar MVP — обраний обсяг', margin + 48, y + 15)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(102, 112, 133)
    doc.text(`Згенеровано ${new Date().toLocaleDateString('uk-UA')}`, margin + 48, y + 31)
    y += 62

    doc.setFillColor(17, 24, 39)
    doc.roundedRect(margin, y, contentWidth, 86, 12, 12, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(24)
    doc.text(formatHours(totals.min, totals.max), margin + 22, y + 35)
    doc.setFontSize(11)
    doc.setTextColor(213, 219, 229)
    doc.text('Обрана оцінка MVP', margin + 22, y + 58)
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.text(formatMonthRange(totals.min, totals.max), margin + 300, y + 35)
    doc.setTextColor(213, 219, 229)
    doc.setFontSize(11)
    doc.text('Календар з 2 сеньйор full-stack розробниками', margin + 300, y + 58)
    y += 112

    addText(
      'Цей PDF фіксує конфігурацію обсягу, яку обрали в керованому калькуляторі. Обовʼязкові блоки вважаються зафіксованою логікою MVP. Прибрані блоки показані разом із наслідками.',
      10,
      'normal',
      [71, 84, 103],
      4,
    )

    addSectionTitle('Розподіл за типом робіт')
    ;(Object.keys(categoryLabels) as Category[]).forEach((category) => {
      const item = totals.breakdown[category]
      addText(`${categoryLabels[category]}: ${formatHours(item.min, item.max)}`, 10, 'bold')
    })

    addSectionTitle('Обраний обсяг')
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

    addSectionTitle('Наслідки урізання')
    if (removedWarnings.length === 0) {
      addText('Рекомендований обсяг MVP не змінено. Жоден рекомендований блок не прибрано.', 10)
    } else {
      removedWarnings.forEach((block) => {
        addText(`${block.title}`, 10, 'bold')
        addText(block.consequence ?? '', 9, 'normal', [102, 112, 133])
      })
    }

    addSectionTitle('Припущення')
    addText('1 розробник повної зайнятості ≈ 160 год/місяць.', 10)
    addText('2 сеньйор full-stack розробники ≈ 320 год/місяць.', 10)
    addText('Календар може змінюватися через приймальне тестування, доступи до інтеграцій, цикли зворотного звʼязку і зміни обсягу.', 10)

    doc.save('grandar-mvp-obranij-scope.pdf')
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">G</div>
          <div>
            <p className="eyeline">Інструмент дискавері від Koitechs</p>
            <h1>Grandar MVP калькулятор обсягу</h1>
          </div>
        </div>
        <div className="topbar-actions">
          <button className="ghost-button" type="button" onClick={selectLeanMvp}>
            Мінімальний MVP
          </button>
          <button className="ghost-button" type="button" onClick={resetRecommendedScope}>
            Рекомендований обсяг
          </button>
          <button className="primary-button" type="button" onClick={copySummary}>
            Скопіювати підсумок
          </button>
          <button className="primary-button export-button" type="button" onClick={exportPdf}>
            Експорт PDF
          </button>
        </div>
      </header>

      <section className="hero-panel">
        <div>
          <p className="section-label">Керований калькулятор</p>
          <h2>Оберіть обсяг без втрати логіки MVP.</h2>
          <p>
            Обовʼязкові блоки заблоковані. Рекомендовані блоки можна прибирати, а калькулятор
            показує, який ризик або ручний процес це створює.
          </p>
        </div>
        <div className="hero-stats" aria-label="Поточна оцінка">
          <div>
            <span>Загальна оцінка</span>
            <strong>{formatHours(totals.min, totals.max)}</strong>
          </div>
          <div>
            <span>2 senior розробники</span>
            <strong>{formatMonthRange(totals.min, totals.max)}</strong>
          </div>
          <div>
            <span>Обрані блоки</span>
            <strong>{totals.picked.length}/{allBlocks.length}</strong>
          </div>
        </div>
      </section>

      <nav className="milestone-nav" aria-label="Фільтри майлстоунів">
        <button
          className={activeMilestone === 'all' ? 'active' : ''}
          type="button"
          onClick={() => setActiveMilestone('all')}
        >
          Усі майлстоуни
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
        <section className="milestone-list" aria-label="Блоки робіт по майлстоунах">
          <div className="list-toolbar">
            <div>
              <p className="section-label">MVP майлстоуни</p>
              <h2>Блоки обсягу</h2>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={showOnlyRemovable}
                onChange={(event) => setShowOnlyRemovable(event.target.checked)}
              />
              Показати тільки те, що можна урізати
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
                          {isLocked ? '•' : isSelected ? '✓' : ''}
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

        <aside className="summary-panel" aria-label="Підсумок оцінки">
          <div className="summary-card total-card">
            <p className="section-label">Обрана оцінка</p>
            <strong>{formatHours(totals.min, totals.max)}</strong>
            <span>{formatMonthRange(totals.min, totals.max)} з 2 сеньйор full-stack розробниками</span>
          </div>

          <div className="summary-card">
            <div className="summary-heading">
              <h3>Розподіл</h3>
              <span>години за типом робіт</span>
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
              <h3>Наслідки урізання</h3>
              <span>{removedWarnings.length} ризиків</span>
            </div>
            {removedWarnings.length === 0 ? (
              <p className="empty-state">Рекомендований обсяг MVP не змінено.</p>
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
            <h3>Припущення</h3>
            <p>1 розробник повної зайнятості ≈ 160 год/місяць.</p>
            <p>2 сеньйор full-stack розробники ≈ 320 год/місяць.</p>
            <p>Календар може змінюватися через приймальне тестування, доступи до інтеграцій і зміни обсягу.</p>
          </div>
        </aside>
      </div>
    </main>
  )
}

export default App
