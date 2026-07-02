export const APP_VERSION = '2.5.0';

export const seedData = {
  profile: {
    appName: 'IP_RJP',
    subtitle: 'Deslocações • Prevenções BT/CC',
    author: 'Rui Jorge Pedro',
    organization: 'Infraestruturas de Portugal',
    year: '2026'
  },
  vehicles: [
    {
      id: 'v-03-zq-46',
      plate: '03-ZQ-46',
      brand: 'Fiat',
      model: '',
      color: 'Branco',
      type: 'Viatura de serviço',
      active: true,
      favorite: true,
      photo: '/vehicles/03-ZQ-46.jpg',
      notes: 'Viatura registada por fotografia.'
    },
    {
      id: 'v-23-zp-64',
      plate: '23-ZP-64',
      brand: 'Renault',
      model: 'Kangoo',
      color: 'Branco',
      type: 'Viatura de serviço',
      active: true,
      favorite: true,
      photo: '/vehicles/23-ZP-64.jpg',
      notes: 'Viatura registada por fotografia.'
    },
    {
      id: 'v-87-hn-72',
      plate: '87-HN-72',
      brand: 'Mitsubishi',
      model: 'L200 DI-D',
      color: 'Branco',
      type: 'Pick-up de serviço',
      active: true,
      favorite: true,
      photo: '/vehicles/87-HN-72.jpg',
      notes: 'Viatura Infraestruturas de Portugal.'
    }
  ],
  places: ['Leiria', 'Caldas da Rainha', 'Marinha Grande', 'São Martinho do Porto', 'Óbidos', 'Bombarral', 'Torres Vedras', 'Mafra', 'Sabugo'],
  activityTypes: ['Inspeção de edifício', 'Inspeção AMV', 'Visita de obra', 'Reunião', 'Formação', 'Levantamento', 'Trabalho administrativo', 'Outro'],
  trips: [],
  guards: [],
  activities: [],
  outlook: { clientId: '', tenantId: '', connected: false }
};
