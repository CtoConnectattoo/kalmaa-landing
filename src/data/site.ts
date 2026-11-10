export const SITE = {
  name: 'Kalmaa',
  url: 'https://kalmaa.io',
  entity: 'Respuestas automáticas en Instagram con ChatGPT y Claude',
  company: 'Connectattoo S.L.',
  contactEmail: 'hola@kalmaa.io', // [CONFIRMAR] buzón de contacto
  ctaLabel: 'Conecta tu Instagram',
  ctaHref: '/lista-de-espera',
};

export const NAV = [
  { label: 'Cómo funciona', href: '/#como-funciona' },
  { label: 'Plantillas', href: '/#plantillas' },
  { label: 'Precios', href: '/precios' },
];

export const FOOTER = {
  producto: [
    { label: 'Cómo funciona', href: '/#como-funciona' },
    { label: 'Plantillas', href: '/#plantillas' },
    { label: 'Precios', href: '/precios' },
  ],
  guias: [
    { label: 'ChatGPT + Instagram', href: '/chatgpt-instagram' },
    { label: 'Claude + Instagram', href: '/claude-instagram' },
    { label: 'MCP para Instagram', href: '/mcp-instagram' },
    { label: 'Respuesta automática en Instagram', href: '/respuesta-automatica-instagram' },
    {
      label: 'Cómo poner un mensaje automático en Instagram',
      href: '/como-poner-mensaje-automatico-instagram',
    },
  ],
  comparativas: [
    { label: 'Qué es ManyChat', href: '/que-es-manychat' },
    { label: 'Precio de ManyChat', href: '/manychat-precio' },
    { label: 'Alternativa a ManyChat', href: '/alternativas/manychat' },
    { label: 'Alternativa a Chatfuel', href: '/alternativas/chatfuel' },
  ],
  legal: [
    { label: 'Aviso legal', href: '/aviso-legal' },
    { label: 'Privacidad', href: '/privacidad' },
    { label: 'Cookies', href: '/cookies' },
  ],
};

export const PRICING = {
  free: {
    name: 'Gratis',
    price: '0 €',
    note: 'Para siempre, sin tarjeta',
    cta: 'Empieza gratis',
    features: [
      '2 automatizaciones activas',
      'Hasta 1.000 DMs al mes',
      'Conecta tu ChatGPT o Claude',
      'Plantillas y paso a WhatsApp',
      'Con «Hecho con Kalmaa» en el DM',
    ],
  },
  pro: {
    name: 'Pro',
    monthly: 12,
    yearlyPerMonth: 9,
    yearlyTotal: 108,
    cta: 'Prueba Pro 14 días gratis',
    features: [
      'Automatizaciones ilimitadas',
      'DMs y contactos ilimitados',
      'Captura de email y exportar contactos',
      'Sin «Hecho con Kalmaa»',
      'Todo lo del plan Gratis',
    ],
  },
  latam: { monthly: 8, yearlyPerMonth: 6 },
};
