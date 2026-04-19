import { CoworkingSpace, Event, MarketplaceListing } from '../types';

const defaultOpeningHours = {
  mon: '08:00-20:00',
  tue: '08:00-20:00',
  wed: '08:00-20:00',
  thu: '08:00-20:00',
  fri: '08:00-20:00',
  sat: '09:00-18:00',
  sun: 'Zavřeno',
};

const createCoworking = (
  id: string,
  name: string,
  city: string,
  region: string,
  overrides: Partial<CoworkingSpace> = {}
): CoworkingSpace => {
  const base: CoworkingSpace = {
    id,
    slug: name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
    name,
    description: `${name} je moderní coworkingový prostor v ${city}, který nabízí kvalitní pracovní prostředí pro freelancery, startupery a týmy. Prostor je vybaven všem potřebným vybavením a podporuje komunitu tvůrců a inovátorů.`,
    shortDescription: `Moderní coworkingový prostor v ${city}`,
    city,
    region,
    address: '',
    zipCode: '',
    latitude: null,
    longitude: null,
    capacity: 20,
    areaM2: 500,
    phone: '',
    email: '',
    website: '',
    openingHours: defaultOpeningHours,
    prices: {
      hourly:    { enabled: true,  from: 99   },
      dayPass:   { enabled: true,  from: 299  },
      openSpace: { enabled: true,  from: 3990 },
      fixDesk:   { enabled: false, from: null },
      office:    { enabled: false, from: null },
    },
    platformTier: null,
    platformActive: false,
    isActive: true,
    isVerified: false,
    isFeatured: false,
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer', 'reception'],
    photos: [],
    locations: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return { ...base, ...overrides };
};

export const coworkingsData: CoworkingSpace[] = [
  createCoworking('cw_locus_workspace', 'Locus Workspace', 'Praha', 'Praha', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer', '24h_access', 'reception', 'events'],
    capacity: 45,
    areaM2: 800,

    photos: [{ id: 'cw_locus_workspace_p1', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80', caption: 'Locus Workspace', isPrimary: true }],

    address: 'Slezská 857/45',
    zipCode: '130 00',
    phone: '+420 735 773 125',
    email: 'info@locusworkspace.com',
    openingHours: {
      mon: '09:00-17:00',
      tue: '09:00-17:00',
      wed: '09:00-17:00',
      thu: '09:00-17:00',
      fri: '09:00-17:00',
      sat: '09:00-17:00',
      sun: '09:00-17:00',
    },
    prices: {
      hourly:    { enabled: false, from: null },
      dayPass:   { enabled: true,  from: 550  },
      openSpace: { enabled: true,  from: 1500 },
      fixDesk:   { enabled: true,  from: 1900 },
      office:    { enabled: false, from: null },
    },
    shortDescription: 'Komunitní anglicky-mluvený coworking pro freelancery a expaty na Vinohradech, kousek od metra Jiřího z Poděbrad.',
    description: 'Locus Workspace je komunitní coworkingový prostor v Praze 3 — Vinohradech, sídlí kousek od metra Jiřího z Poděbrad. Slouží zejména anglicky mluvícím freelancerům, digitálním nomádům a expatům. Nabízí denní vstupy (Day Pass), flexibilní členství i fix desky, pravidelné komunitní akce a dostupnost 7 dní v týdnu pro day-pass návštěvníky. Ceny jsou uváděny bez 21% DPH.',
    website: 'https://www.locusworkspace.cz',
  }),
  createCoworking('cw_opero', 'Opero', 'Praha', 'Praha', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer', 'reception', 'events', 'projector', 'air_conditioning'],
    capacity: 60,
    areaM2: 1000,
    website: 'https://www.opero.cz',

    photos: [{ id: 'cw_opero_p1', url: 'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&w=800&q=80', caption: 'Opero', isPrimary: true }],

    address: 'Salvátorská 931/8',
    zipCode: '110 00',
    phone: '+420 777 167 376',
    email: 'recepce@opero.cz',
    openingHours: {
      mon: '08:00-20:00',
      tue: '08:00-20:00',
      wed: '08:00-20:00',
      thu: '08:00-20:00',
      fri: '08:00-20:00',
      sat: 'Dle domluvy',
      sun: 'Dle domluvy',
    },
    prices: {
      hourly:    { enabled: false, from: null },
      dayPass:   { enabled: false, from: null },
      openSpace: { enabled: true,  from: 2500 },
      fixDesk:   { enabled: true,  from: 6000 },
      office:    { enabled: true,  from: 12000 },
    },
    shortDescription: 'Reprezentativní byznys hub a coworking v historickém Štencově domě, pár kroků od Staroměstského náměstí.',
    description: 'Opero je byznys hub a coworking v historickém Štencově domě v centru Prahy, jen pár kroků od Staroměstského náměstí. Nabízí 5 zasedacích místností, velký sál s galerií a inspirativní komunitu pro freelancery, startupy a etablované byznysy. Členství v Opero klubu začíná na 2 500 Kč/měsíc bez DPH. Otevřeno pondělí až pátek, víkendy dle domluvy.',
    hasEventSpace: true,
    venueTypes: ['meeting', 'conference', 'workshop', 'party'],
  }),
  createCoworking('cw_mo_cha_vista', 'Mo-cha Vista', 'Praha', 'Praha', {
    website: 'https://mo-cha.cz',
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'cafe', 'printer'],
    capacity: 25,
    areaM2: 400,
  
    photos: [{ id: 'cw_mo_cha_vista_p1', url: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=800&q=80', caption: 'Mo-cha Vista', isPrimary: true }],
  
    address: 'Na Pankráci 30',
    zipCode: '140 00',
    shortDescription: 'Útulný coworkingový prostor s kavárnou v moderní budově na Pankráci.',
  }),
  createCoworking('cw_node5', 'Node5', 'Praha', 'Praha', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer', '24h_access', 'events'],
    capacity: 55,
    areaM2: 850,
    website: 'https://www.node5.cz',
  
    photos: [{ id: 'cw_node5_p1', url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80', caption: 'Node5', isPrimary: true }],
  
    address: 'Radlická 180/50',
    zipCode: '150 00',
    prices: {
      hourly:    { enabled: false,  from: null   },
      dayPass:   { enabled: true,  from: 200  },
      openSpace: { enabled: true,  from: 1300 },
      fixDesk:   { enabled: false, from: null },
      office:    { enabled: false, from: null },
    },
    shortDescription: 'Velký technologický hub v Praze 5 s flexibilními kancelářemi a startupovou atmosférou.',
  }),
  createCoworking('cw_worklounge', 'WorkLounge', 'Praha', 'Praha', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer', 'reception', 'locker'],
    capacity: 70,
    areaM2: 1100,
    website: 'https://www.worklounge.cz',
  
    photos: [{ id: 'cw_worklounge_p1', url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80', caption: 'WorkLounge', isPrimary: true }],
  
    address: 'Na Příkopě 14',
    zipCode: '110 00',
    prices: {
      hourly:    { enabled: false,  from: null   },
      dayPass:   { enabled: true,  from: 490  },
      openSpace: { enabled: true,  from: 3900 },
      fixDesk:   { enabled: false, from: null },
      office:    { enabled: false, from: null },
    },
    shortDescription: 'Prémiový coworking na Příkopě s recepcí, zasedacími místnostmi a flexibilními tarify.',
  }),
  createCoworking('cw_pracovna_vlkova', 'Pracovna Vlkova 36 a Zlatnická 12', 'Praha', 'Praha', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer', 'reception'],
    capacity: 40,
    areaM2: 700,
  
    photos: [{ id: 'cw_pracovna_vlkova_p1', url: 'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?auto=format&fit=crop&w=800&q=80', caption: 'Pracovna Vlkova 36 a Zlatnická 12', isPrimary: true }],
  
    address: 'Vlkova 628/36',
    zipCode: '130 00',
    prices: {
      hourly:    { enabled: false,  from: null   },
      dayPass:   { enabled: false,  from: null  },
      openSpace: { enabled: true,  from: 950 },
      fixDesk:   { enabled: false, from: null },
      office:    { enabled: false, from: null },
    },
    shortDescription: 'Dostupný a přátelský coworking na Žižkově pro freelancery a malé týmy.',
    website: 'https://www.pracovna.co',
  }),
  createCoworking('cw_co_labs', 'Co-Labs', 'Praha', 'Praha', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer', 'events'],
    capacity: 30,
    areaM2: 550,
  
    photos: [{ id: 'cw_co_labs_p1', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80', caption: 'Co-Labs', isPrimary: true }],
  
    address: 'Korunní 2569/108',
    zipCode: '101 00',
    shortDescription: 'Co-Labs – profesionální coworkingový prostor v Praze 10 pro jednotlivce a menší firmy.',
    website: 'https://www.co-labs.cz',
  }),
  createCoworking('cw_scott_weber', 'Scott.Weber', 'Praha', 'Praha', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer', 'reception', 'locker'],
    capacity: 100,
    areaM2: 1500,
    website: 'https://www.scottweber.cz',
  
    photos: [{ id: 'cw_scott_weber_p1', url: 'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?auto=format&fit=crop&w=800&q=80', caption: 'Scott.Weber', isPrimary: true }],
  
    address: 'Pernerova 697/35',
    zipCode: '186 00',
    prices: {
      hourly:    { enabled: false,  from: null   },
      dayPass:   { enabled: false,  from: null  },
      openSpace: { enabled: true,  from: 5000 },
      fixDesk:   { enabled: false, from: null },
      office:    { enabled: false, from: null },
    },
    shortDescription: 'Prémiové coworkingové prostory na 6 lokacích po Praze s full servisem.',
  }),
  createCoworking('cw_mumraj', 'Mumraj', 'Praha', 'Praha', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'childcare', 'printer', 'reception'],
    capacity: 35,
    areaM2: 650,
  
    photos: [{ id: 'cw_mumraj_p1', url: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=800&q=80', caption: 'Mumraj', isPrimary: true }],
  
    address: 'Mezilesí 2058/6',
    zipCode: '193 00',
    prices: {
      hourly:    { enabled: true,  from: 170   },
      dayPass:   { enabled: false,  from: null  },
      openSpace: { enabled: false,  from: null },
      fixDesk:   { enabled: false, from: null },
      office:    { enabled: false, from: null },
    },
    shortDescription: 'Rodinné centrum s coworkingem a hlídáním dětí v Horních Počernicích.',
    website: 'https://www.domumraje.cz',
  }),
  createCoworking('cw_ponk_space', 'Ponk Space', 'Praha', 'Praha', {
    website: 'https://ponk.space',
    amenities: ['wifi', 'workshop_tools', 'kitchen', 'printer', 'events'],
    capacity: 25,
    areaM2: 500,
  
    photos: [{ id: 'cw_ponk_space_p1', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80', caption: 'Ponk Space', isPrimary: true }],
  
    address: 'Drtinova 10',
    zipCode: '150 00',
    shortDescription: 'Ponk Space – komunitní dílna a makerspace pro tvůrce a designéry v Praze.',
  }),
  createCoworking('cw_microsoft_coworking', 'Microsoft Coworking Space', 'Praha', 'Praha', {
    website: 'https://blogs.msdn.microsoft.com/vyvojari/2019/02/07/vitejte-v-novem-microsoft-coworking-space-v-praze/',
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer', '24h_access', 'reception'],
    capacity: 90,
    areaM2: 1400,
  
    photos: [{ id: 'cw_microsoft_coworking_p1', url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80', caption: 'Microsoft Coworking Space', isPrimary: true }],
  
    address: 'Vyskočilova 1561/4a',
    zipCode: '140 00',
    shortDescription: 'Microsoft Coworking Space – moderní pracovní prostor v kampusu Microsoftu v Praze.',
  }),
  createCoworking('cw_archihub', 'ArchiHUB', 'Praha', 'Praha', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer', 'events'],
    capacity: 40,
    areaM2: 750,
  
    photos: [{ id: 'cw_archihub_p1', url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80', caption: 'ArchiHUB', isPrimary: true }],
  
    address: 'Puškinovo nám. 681/3',
    zipCode: '160 00',
    shortDescription: 'Architektonicky inspirativní coworking na Puškinově náměstí v Bubenči.',
    website: 'https://archihub.cz',
  }),
  createCoworking('cw_komunitni_centrum_jahoda', 'Komunitní rodinné centrum Jahoda Albertov', 'Praha', 'Praha', {
    website: 'https://jahoda.cz/krouzky/coworking/',
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'childcare', 'events'],
    capacity: 30,
    areaM2: 600,
  
    photos: [{ id: 'cw_komunitni_centrum_jahoda_p1', url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80', caption: 'Komunitní rodinné centrum Jahoda Albertov', isPrimary: true }],
  
    address: 'Albertov 2059/7',
    zipCode: '128 00',
    shortDescription: 'Komunitní centrum Jahoda Albertov – rodinný prostor s coworkingem pro pracující rodiče.',
  }),
  createCoworking('cw_lamparna_lidicka', 'Lampárna Lidická', 'Praha', 'Praha', {
    website: 'https://lamparnalidicka.cz',
    amenities: ['wifi', 'kitchen', 'printer', 'events'],
    capacity: 20,
    areaM2: 400,
  
    photos: [{ id: 'cw_lamparna_lidicka_p1', url: 'https://images.unsplash.com/photo-1572025442646-866d16c84a54?auto=format&fit=crop&w=800&q=80', caption: 'Lampárna Lidická', isPrimary: true }],
  
    address: 'Lidická 1200/53',
    zipCode: '150 00',
    shortDescription: 'Lampárna Lidická – komunitní prostor s coworkingem a kreativním programem v Praze 5.',
  }),
  createCoworking('cw_meandr_revnice', 'Meandr Řevnice', 'Praha', 'Praha', {
    website: 'https://www.meandrrevnice.cz',
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer'],
    capacity: 15,
    areaM2: 350,
  
    photos: [{ id: 'cw_meandr_revnice_p1', url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80', caption: 'Meandr Řevnice', isPrimary: true }],
  
    address: 'Okružní 1233',
    zipCode: '252 30',
    shortDescription: 'Meandr Řevnice – coworking a kreativní prostor u řeky Berounky.',
  }),
  createCoworking('cw_coworking33', 'Coworking33', 'Praha', 'Praha', {
    website: 'https://coworking33.cz',
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer'],
    capacity: 25,
    areaM2: 450,
  
    photos: [{ id: 'cw_coworking33_p1', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80', caption: 'Coworking33', isPrimary: true }],
  
    address: 'Bělohorská 1667/58',
    zipCode: '169 00',
    shortDescription: 'Coworking33 – flexibilní pracovní prostor na Bílé Hoře v Praze 6.',
  }),
  createCoworking('cw_clubco_praha', 'Clubco', 'Praha', 'Praha', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer', 'events'],
    capacity: 50,
    areaM2: 900,
    website: 'https://www.clubco.cz',
  
    photos: [{ id: 'cw_clubco_praha_p1', url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80', caption: 'Clubco', isPrimary: true }],
  
    address: 'Nupaky 148',
    zipCode: '251 01',
    shortDescription: 'Moderní coworking Clubco u Prahy s event prostorem a plným servisem.',
  }),
  createCoworking('cw_dum_radost', 'Dům Radost', 'Praha', 'Praha', {
    website: 'https://www.dumradost.cz/cs/pronajem/desk-lounge',
    amenities: ['wifi', 'kitchen', 'printer', 'events'],
    capacity: 20,
    areaM2: 380,
  
    photos: [{ id: 'cw_dum_radost_p1', url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80', caption: 'Dům Radost', isPrimary: true }],
  
    address: 'Mánesova 872/28',
    zipCode: '120 00',
    shortDescription: 'Dům Radost – multifunkční prostor s coworkingem, kavárnou a kulturním programem na Vinohradech.',
  }),
  createCoworking('cw_salounova_vila', 'Šalounova vila', 'Praha', 'Praha', {
    website: 'https://salounova-vila.odonata.cz/salounova-vila/',
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer'],
    capacity: 35,
    areaM2: 650,
  
    photos: [{ id: 'cw_salounova_vila_p1', url: 'https://images.unsplash.com/photo-1564069114553-7215e1ff1890?auto=format&fit=crop&w=800&q=80', caption: 'Šalounova vila', isPrimary: true }],
  
    address: 'Na Příkopě 583/15',
    zipCode: '110 00',
    shortDescription: 'Šalounova vila – jedinečný historický prostor pro práci a setkávání v Praze.',
  }),
  createCoworking('cw_jednacky_hradcanska', 'Jednačky Hradčanská', 'Praha', 'Praha', {
    website: 'https://www.jednackyhradcanska.anfas.cz',
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer'],
    capacity: 30,
    areaM2: 550,
  
    photos: [{ id: 'cw_jednacky_hradcanska_p1', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80', caption: 'Jednačky Hradčanská', isPrimary: true }],
  
    address: 'Dejvická 308/1',
    zipCode: '160 00',
    shortDescription: 'Jednačky Hradčanská – komunitní coworking zaměřený na rodiče a ženy podnikatelky.',
  }),
  createCoworking('cw_zenwork_palac_ara', 'Zenwork Palác ARA', 'Praha', 'Praha', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer', '24h_access'],
    capacity: 45,
    areaM2: 800,
  
    photos: [{ id: 'cw_zenwork_palac_ara_p1', url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80', caption: 'Zenwork Palác ARA', isPrimary: true }],
  
    address: 'Perlová 371/5',
    zipCode: '110 00',
    prices: {
      hourly:    { enabled: false,  from: null   },
      dayPass:   { enabled: false,  from: null  },
      openSpace: { enabled: true,  from: 5850 },
      fixDesk:   { enabled: false, from: null },
      office:    { enabled: false, from: null },
    },
    shortDescription: 'Luxusní coworking v historickém Paláci ARA v centru Prahy.',
    website: 'https://www.zenwork.cz',
  }),
  createCoworking('cw_vysehradska_49', 'Vyšehradská 49', 'Praha', 'Praha', {
    website: 'https://www.vysehradska49.cz',
    amenities: ['wifi', 'kitchen', 'printer'],
    capacity: 20,
    areaM2: 400,
  
    photos: [{ id: 'cw_vysehradska_49_p1', url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80', caption: 'Vyšehradská 49', isPrimary: true }],
  
    address: 'Vyšehradská 49',
    zipCode: '128 00',
    shortDescription: 'Sdílený coworkingový prostor ve Vyšehradské ulici v Praze 2.',
  }),
  createCoworking('cw_yottabe_praha', 'Yottabe', 'Praha', 'Praha', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer', 'events'],
    capacity: 40,
    areaM2: 700,
  
    photos: [{ id: 'cw_yottabe_praha_p1', url: 'https://images.unsplash.com/photo-1564069114553-7215e1ff1890?auto=format&fit=crop&w=800&q=80', caption: 'Yottabe', isPrimary: true }],
  
    address: 'Vinohradská 2396/184',
    zipCode: '130 00',
    prices: {
      hourly:    { enabled: true,  from: 100   },
      dayPass:   { enabled: true,  from: 200  },
      openSpace: { enabled: false,  from: null },
      fixDesk:   { enabled: false, from: null },
      office:    { enabled: false, from: null },
    },
    shortDescription: 'Yottabe Praha – sdílený prostor pro produktivní práci s kancelářským vybavením.',
    website: 'https://www.yottabe.com',
  }),
  createCoworking('cw_wework_drn', 'Wework DRN', 'Praha', 'Praha', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer', 'reception'],
    capacity: 60,
    areaM2: 1000,
  
    photos: [{ id: 'cw_wework_drn_p1', url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80', caption: 'Wework DRN', isPrimary: true }],
  
    address: 'Národní 135/14',
    zipCode: '110 00',
    shortDescription: 'WeWork v ikonické budově DRN s flexibilními kancelářemi a moderním zázemím.',
    website: 'https://www.wework.com/buildings/drn--prague',
  }),
  createCoworking('cw_spaces_praha', 'Spaces', 'Praha', 'Praha', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer', 'reception', 'locker'],
    capacity: 75,
    areaM2: 1200,
    website: 'https://www.spacesworks.com',
  
    photos: [{ id: 'cw_spaces_praha_p1', url: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=800&q=80', caption: 'Spaces', isPrimary: true }],
  
    address: 'Náměstí Republiky 1a',
    zipCode: '110 00',
    prices: {
      hourly:    { enabled: false,  from: null   },
      dayPass:   { enabled: false,  from: null  },
      openSpace: { enabled: true,  from: 5000 },
      fixDesk:   { enabled: false, from: null },
      office:    { enabled: false, from: null },
    },
    shortDescription: 'Globální síť flexibilních kancelářských prostorů Spaces v centru Prahy.',
  }),
  createCoworking('cw_moovin_space', 'Moovin Space', 'Praha', 'Praha', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer'],
    capacity: 35,
    areaM2: 650,
  
    photos: [{ id: 'cw_moovin_space_p1', url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=80', caption: 'Moovin Space', isPrimary: true }],
  
    address: 'Újezd 412/17',
    zipCode: '118 00',
    prices: {
      hourly:    { enabled: false,  from: null   },
      dayPass:   { enabled: false,  from: null  },
      openSpace: { enabled: true,  from: 5500 },
      fixDesk:   { enabled: false, from: null },
      office:    { enabled: false, from: null },
    },
    shortDescription: 'Síť sdílených kanceláří v prémiových lokacích po celé Praze s okamžitým nastěhováním.',
    website: 'https://moovin.space',
  }),
  createCoworking('cw_praha_hygge', 'Praha.Hygge', 'Praha', 'Praha', {
    amenities: ['wifi', 'kitchen', 'cafe', 'printer'],
    capacity: 25,
    areaM2: 450,
  
    photos: [{ id: 'cw_praha_hygge_p1', url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80', caption: 'Praha.Hygge', isPrimary: true }],
  
    address: 'Korunní 104',
    zipCode: '101 00',
    shortDescription: 'Praha.Hygge – útulné soukromé kanceláře a coworking ve vinohradském stylu.',
    website: 'https://praha.hygge.cz',
  }),
  createCoworking('cw_effectix_hub', 'Effectix Hub', 'Praha', 'Praha', {
    website: 'https://www.effectix.com/coworking/',
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer', 'events'],
    capacity: 30,
    areaM2: 550,
  
    photos: [{ id: 'cw_effectix_hub_p1', url: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=800&q=80', caption: 'Effectix Hub', isPrimary: true }],
  
    address: 'Kodaňská 1441/46',
    zipCode: '101 00',
    shortDescription: 'Effectix Hub – coworking a kreativní prostor v Praze 10 pro digitální profesionály.',
  }),
  createCoworking('cw_hasicarna', 'Komunitní centrum Hasičárna', 'Praha', 'Praha', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'events', 'printer'],
    capacity: 40,
    areaM2: 750,
  
    photos: [{ id: 'cw_hasicarna_p1', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80', caption: 'Komunitní centrum Hasičárna', isPrimary: true }],
  
    address: 'K Lučinám 2591/23',
    zipCode: '130 00',
    shortDescription: 'Komunitní centrum v bývalé hasičárně na Žižkově s coworkingem a kavárnou.',
    website: 'https://www.ulita.cz/hasicarna',
  }),
  createCoworking('cw_coworking_idea_fair', 'Coworking Idea Fair – VŠE', 'Praha', 'Praha', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer', 'events'],
    capacity: 35,
    areaM2: 600,
  
    photos: [{ id: 'cw_coworking_idea_fair_p1', url: 'https://images.unsplash.com/photo-1416339134316-0e91dc9ded92?auto=format&fit=crop&w=800&q=80', caption: 'Coworking Idea Fair – VŠE', isPrimary: true }],
  
    address: 'nám. Winstona Churchilla 4',
    zipCode: '130 67',
    shortDescription: 'Coworkingový prostor v budově Vysoké školy ekonomické v Praze.',
    website: 'https://coworking.vse.cz',
  }),
  createCoworking('cw_cowork28', 'CoworK28', 'Praha', 'Praha', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer'],
    capacity: 25,
    areaM2: 400,
    website: 'https://cowork28.cz/',
    photos: [{ id: 'cw_cowork28_p1', url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80', caption: 'CoworK28', isPrimary: true }],
    address: '',
    zipCode: '',
    shortDescription: 'Komunitní coworkingový prostor v Praze s přátelskou atmosférou.',
  }),
  createCoworking('cw_impact_hub_brno', 'Impact Hub Brno', 'Brno', 'Jihomoravský kraj', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer', 'reception', 'events'],
    capacity: 70,
    areaM2: 1100,
    website: 'https://www.impacthub.cz',
  
    photos: [{ id: 'cw_impact_hub_brno_p1', url: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=800&q=80', caption: 'Impact Hub Brno', isPrimary: true }],
  
    address: 'Cyrilská 7',
    zipCode: '602 00',
    prices: {
      hourly:    { enabled: false,  from: null   },
      dayPass:   { enabled: false,  from: null  },
      openSpace: { enabled: true,  from: 2990 },
      fixDesk:   { enabled: false, from: null },
      office:    { enabled: false, from: null },
    },
    shortDescription: 'Největší a nejzavedenější coworking v Brně s bohatou komunitou a pravidelnými akcemi.',
  }),
  createCoworking('cw_brain_farm', 'Brain Farm', 'Brno', 'Jihomoravský kraj', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer', 'reception'],
    capacity: 50,
    areaM2: 900,
  
    photos: [{ id: 'cw_brain_farm_p1', url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=80', caption: 'Brain Farm', isPrimary: true }],
  
    address: 'Moravské nám. 4',
    zipCode: '602 00',
    shortDescription: 'Intimní coworking pro ~15 lidí v samotném srdci Brna.',
    website: 'https://www.brainfarm.cz',
  }),
  createCoworking('cw_edunesto', 'EDUnesto', 'Brno', 'Jihomoravský kraj', {
    website: 'https://www.edunesto.com',
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer', 'events'],
    capacity: 40,
    areaM2: 700,
  
    photos: [{ id: 'cw_edunesto_p1', url: 'https://images.unsplash.com/photo-1453928582365-b6ad33cbcf64?auto=format&fit=crop&w=800&q=80', caption: 'EDUnesto', isPrimary: true }],
  
    address: 'Josefská 7',
    zipCode: '602 00',
    shortDescription: 'EDUnesto – vzdělávací a coworkingový prostor v centru Brna.',
  }),
  createCoworking('cw_branta_workspace', 'Branta Workspace', 'Brno', 'Jihomoravský kraj', {
    website: 'https://www.branta.cz',
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer'],
    capacity: 30,
    areaM2: 550,
  
    photos: [{ id: 'cw_branta_workspace_p1', url: 'https://images.unsplash.com/photo-1547496502-affa22d38842?auto=format&fit=crop&w=800&q=80', caption: 'Branta Workspace', isPrimary: true }],
  
    address: 'Cejl 509/41',
    zipCode: '602 00',
    shortDescription: 'Moderní workspace v Zábrdovicích s flexibilními kancelářemi a kreativní atmosférou.',
  }),
  createCoworking('cw_cowo_brno', 'Cowo Brno', 'Brno', 'Jihomoravský kraj', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer'],
    capacity: 45,
    areaM2: 800,

    photos: [{ id: 'cw_cowo_brno_p1', url: 'https://images.unsplash.com/photo-1547496502-affa22d38842?auto=format&fit=crop&w=800&q=80', caption: 'Cowo Brno', isPrimary: true }],

    address: 'Moravské nám. 3',
    zipCode: '602 00',
    phone: '+420 733 437 467',
    email: 'ahoj@cowobrno.cz',
    openingHours: {
      mon: '08:00-22:00',
      tue: '08:00-22:00',
      wed: '08:00-22:00',
      thu: '08:00-22:00',
      fri: '08:00-21:00',
      sat: '08:00-21:00',
      sun: '08:00-21:00',
    },
    shortDescription: 'Útulný sdílený coworking přímo na Moravském náměstí v centru Brna, otevřený 7 dní v týdnu.',
    description: 'Cowo Brno je útulný sdílený coworking na Moravském náměstí 3 v samém centru Brna. Nabízí možnost pracovat bez členství i jednorázový pronájem místa, kuchyňku, zasedačku k pronájmu a relax zónu. Otevřeno Po–Čt 8:00–22:00 a Pá–Ne 8:00–21:00.',
    website: 'https://www.cowobrno.cz',
  }),
  createCoworking('cw_kumst', 'KUMST', 'Brno', 'Jihomoravský kraj', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer', 'workshop_tools', 'reception', 'events'],
    capacity: 35,
    areaM2: 650,

    photos: [{ id: 'cw_kumst_p1', url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80', caption: 'KUMST', isPrimary: true }],

    address: 'Údolní 495/19',
    zipCode: '602 00',
    phone: '+420 776 875 043',
    email: 'hello@kumstbrno.cz',
    openingHours: {
      mon: '08:30-16:00',
      tue: '08:30-16:00',
      wed: '08:30-16:00',
      thu: '08:30-16:00',
      fri: '08:30-16:00',
      sat: 'Zavřeno',
      sun: 'Zavřeno',
    },
    prices: {
      hourly:    { enabled: false, from: null },
      dayPass:   { enabled: true,  from: 200  },
      openSpace: { enabled: true,  from: 2500 },
      fixDesk:   { enabled: false, from: null },
      office:    { enabled: false, from: null },
    },
    shortDescription: 'Kreativní hub v centru Brna s coworkingem ve 2. patře, FabLabem a dílnou s 3D tiskárnami a laserovými řezačkami.',
    description: 'KUMST je kreativní hub v centru Brna provozovaný JIC. Coworkingové prostory se nachází ve 2. patře budovy A, doplněné o FabLab s 3D tiskárnami, laserovými řezačkami a programovatelnými šicími a vyšívacími stroji, plus dílnu se základním nářadím. K dispozici je i kuchyňka s kávovarem od lokální pražírny. Recepce otevřena Po–Pá 8:30–16:00.',
    website: 'https://www.kumstbrno.cz',
  }),
  createCoworking('cw_clubco_brno', 'Clubco', 'Brno', 'Jihomoravský kraj', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer', 'events'],
    capacity: 50,
    areaM2: 900,
  
    photos: [{ id: 'cw_clubco_brno_p1', url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80', caption: 'Clubco', isPrimary: true }],
  
    address: 'Vlněná 5',
    zipCode: '602 00',
    prices: {
      hourly:    { enabled: false,  from: null   },
      dayPass:   { enabled: false,  from: null  },
      openSpace: { enabled: true,  from: 3900 },
      fixDesk:   { enabled: false, from: null },
      office:    { enabled: false, from: null },
    },
    shortDescription: 'Moderní a živý coworking ve Vlněna business parku s event prostorem a barevným designem.',
    website: 'https://clubco.cz/brno',
  }),
  createCoworking('cw_coworking_na_paluby', 'Coworking na Palubě', 'Brno', 'Jihomoravský kraj', {
    website: 'https://www.linkedin.com/pulse/coworking-na-palubě-court-of-moravia/',
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer'],
    capacity: 25,
    areaM2: 450,
  
    photos: [{ id: 'cw_coworking_na_paluby_p1', url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80', caption: 'Coworking na Palubě', isPrimary: true }],
  
    address: 'Příční 4',
    zipCode: '603 00',
    shortDescription: 'Coworking na Palubě – sdílený pracovní prostor v centru Brna.',
  }),
  createCoworking('cw_jic_cowork_brno', 'JIC cowork Brno', 'Brno', 'Jihomoravský kraj', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer', 'reception'],
    capacity: 40,
    areaM2: 700,
  
    photos: [{ id: 'cw_jic_cowork_brno_p1', url: 'https://images.unsplash.com/photo-1573167243872-43c6433b9d40?auto=format&fit=crop&w=800&q=80', caption: 'JIC cowork Brno', isPrimary: true }],
  
    address: 'Purkyňova 127',
    zipCode: '612 00',
    shortDescription: 'Coworking Jihomoravského inovačního centra pro technologické firmy a inovativní startupy.',
    website: 'https://www.jic.cz',
  }),
  createCoworking('cw_simpl_kancl', 'Simpl Kancl', 'Brno', 'Jihomoravský kraj', {
    website: 'https://simplkancl.cz',
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer'],
    capacity: 20,
    areaM2: 400,
  
    photos: [{ id: 'cw_simpl_kancl_p1', url: 'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?auto=format&fit=crop&w=800&q=80', caption: 'Simpl Kancl', isPrimary: true }],
  
    address: 'V Újezdech 569/7',
    zipCode: '621 00',
    shortDescription: 'Flexibilní kancelářský prostor v Medlánkách pro jednotlivce a malé týmy.',
  }),
  createCoworking('cw_minicowork_lemur', 'Minicowork Lemur', 'Brno', 'Jihomoravský kraj', {
    amenities: ['wifi', 'kitchen', 'printer'],
    capacity: 15,
    areaM2: 300,
  
    photos: [{ id: 'cw_minicowork_lemur_p1', url: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=800&q=80', caption: 'Minicowork Lemur', isPrimary: true }],
  
    address: 'nám. 28. dubna 36',
    zipCode: '635 00',
    shortDescription: 'Mini coworking s dětskou herničkou – pracujte, zatímco vaše děti si bezpečně hrají.',
    website: 'http://minicowork.cz',
  }),
  createCoworking('cw_impact_hub_ostrava', 'Impact Hub Ostrava', 'Ostrava', 'Moravskoslezský kraj', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer', 'reception', 'events', 'cafe', 'childcare'],
    capacity: 60,
    areaM2: 1000,

    photos: [{ id: 'cw_impact_hub_ostrava_p1', url: 'https://images.unsplash.com/photo-1572025442646-866d16c84a54?auto=format&fit=crop&w=800&q=80', caption: 'Impact Hub Ostrava', isPrimary: true }],

    address: 'Sokolská třída 1263/24',
    zipCode: '702 00',
    phone: '+420 774 142 014',
    email: 'ostrava@impacthub.cz',
    openingHours: {
      mon: '07:30-17:30',
      tue: '07:30-17:30',
      wed: '07:30-17:30',
      thu: '07:30-17:30',
      fri: '07:30-17:30',
      sat: 'Zavřeno',
      sun: 'Zavřeno',
    },
    shortDescription: 'Impact Hub Ostrava — místo pro inovátory a podnikatele v centru města, s kavárnou a prostorem pro děti.',
    description: 'Impact Hub Ostrava je coworking, kancelářské prostory a komunita pro podnikatele v centru Ostravy na Sokolské třídě. Součástí je rychlé wifi, tiskárna, kuchyňka, kavárna/restaurace, zasedací místnosti k pronájmu (od 250 Kč/hod), relaxační zóna a baby-friendly prostor s hračkami a knihami pro děti. Otevřeno Po–Pá 7:30–17:30.',
    hasEventSpace: true,
    venueTypes: ['meeting', 'workshop', 'conference', 'teambuilding'],
    website: 'https://impacthub.cz/ostrava',
  }),
  createCoworking('cw_clubco_ostrava', 'Clubco', 'Ostrava', 'Moravskoslezský kraj', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer', 'events'],
    capacity: 45,
    areaM2: 800,
  
    photos: [{ id: 'cw_clubco_ostrava_p1', url: 'https://images.unsplash.com/photo-1564069114553-7215e1ff1890?auto=format&fit=crop&w=800&q=80', caption: 'Clubco', isPrimary: true }],
  
    address: '28. října 3346/91',
    zipCode: '702 00',
    prices: {
      hourly:    { enabled: false,  from: null   },
      dayPass:   { enabled: false,  from: null  },
      openSpace: { enabled: true,  from: 4900 },
      fixDesk:   { enabled: false, from: null },
      office:    { enabled: false, from: null },
    },
    shortDescription: 'Premium coworking Clubco v centru Ostravy v moderním IQ parku.',
    website: 'https://clubco.cz/ostrava',
  }),
  createCoworking('cw_fajna_dilna', 'Fajna dilna', 'Ostrava', 'Moravskoslezský kraj', {
    website: 'https://fajnadilna.cz',
    amenities: ['wifi', 'workshop_tools', 'kitchen', 'printer'],
    capacity: 30,
    areaM2: 600,
  
    photos: [{ id: 'cw_fajna_dilna_p1', url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80', caption: 'Fajna dilna', isPrimary: true }],
  
    address: 'Sokolská třída 581/1',
    zipCode: '702 00',
    shortDescription: 'Fajna dilna – první otevřená dílna v Ostravě s 5 plně vybavenými workshopy.',
  }),
  createCoworking('cw_mamahub_koutek_sveta', 'Mamahub Koutek světa', 'Ostrava', 'Moravskoslezský kraj', {
    website: 'https://www.kouteksveta.cz',
    amenities: ['wifi', 'kitchen', 'childcare', 'printer'],
    capacity: 25,
    areaM2: 450,
  
    photos: [{ id: 'cw_mamahub_koutek_sveta_p1', url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80', caption: 'Mamahub Koutek světa', isPrimary: true }],
  
    address: 'Zámecká 480/9',
    zipCode: '702 00',
    shortDescription: 'Mamahub Koutek světa – coworking s hlídáním dětí pro pracující rodiče v Ostravě.',
  }),
  createCoworking('cw_hnizdo_ostrava', 'Hnízdo', 'Ostrava', 'Moravskoslezský kraj', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer'],
    capacity: 20,
    areaM2: 400,
  
    photos: [{ id: 'cw_hnizdo_ostrava_p1', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80', caption: 'Hnízdo', isPrimary: true }],
  
    address: 'Střelniční 75/8',
    zipCode: '702 00',
    shortDescription: 'Komunitní coworking a studio v Ostravě pro kreativce a freelancery.',
    website: 'https://www.hnizdoostrava.cz',
  }),
  createCoworking('cw_ostrava_hygge', 'Ostrava.Hygge', 'Ostrava', 'Moravskoslezský kraj', {
    amenities: ['wifi', 'kitchen', 'cafe', 'printer'],
    capacity: 20,
    areaM2: 380,
  
    photos: [{ id: 'cw_ostrava_hygge_p1', url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80', caption: 'Ostrava.Hygge', isPrimary: true }],
  
    address: 'Stodolní 16',
    zipCode: '702 00',
    shortDescription: 'Ostrava.Hygge – soukromé kanceláře, coworking a zasedačky v centru Ostravy.',
    website: 'https://ostrava.hygge.cz',
  }),
  createCoworking('cw_cowo_cb', 'Cowo CB', 'České Budějovice', 'Jihočeský kraj', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer', 'reception'],
    capacity: 35,
    areaM2: 650,
  
    photos: [{ id: 'cw_cowo_cb_p1', url: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=800&q=80', caption: 'Cowo CB', isPrimary: true }],
  
    address: 'Široká 443/19',
    zipCode: '370 01',
    shortDescription: 'Sdílená kancelář v centru Českých Budějovic s přátelskou komunitou.',
    website: 'https://www.cowocb.cz',
  }),
  createCoworking('cw_pracovna_r51', 'Pracovna R51', 'České Budějovice', 'Jihočeský kraj', {
    website: 'https://www.riegrova51.cz/pracovna-r51/',
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer'],
    capacity: 25,
    areaM2: 450,
  
    photos: [{ id: 'cw_pracovna_r51_p1', url: 'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&w=800&q=80', caption: 'Pracovna R51', isPrimary: true }],
  
    address: 'Riegrova 1756/51',
    zipCode: '370 01',
    shortDescription: 'Moderní coworking ve strategické poloze v Českých Budějovicích.',
  }),
  createCoworking('cw_coworking_vste', 'Coworking VŠTE', 'České Budějovice', 'Jihočeský kraj', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer'],
    capacity: 30,
    areaM2: 550,
  
    photos: [{ id: 'cw_coworking_vste_p1', url: 'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?auto=format&fit=crop&w=800&q=80', caption: 'Coworking VŠTE', isPrimary: true }],
  
    address: 'Kněžská 5',
    zipCode: '370 01',
    shortDescription: 'Coworking na Vysoké škole technické a ekonomické v Českých Budějovicích.',
    website: 'https://www.coworkingvste.cz',
  }),
  createCoworking('cw_budehub', 'BudeHub', 'České Budějovice', 'Jihočeský kraj', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer', 'events'],
    capacity: 40,
    areaM2: 700,
  
    photos: [{ id: 'cw_budehub_p1', url: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=800&q=80', caption: 'BudeHub', isPrimary: true }],
  
    address: 'Rudolfovská tř. 64/34',
    zipCode: '370 01',
    prices: {
      hourly:    { enabled: false,  from: null   },
      dayPass:   { enabled: true,  from: 350  },
      openSpace: { enabled: true,  from: 2000 },
      fixDesk:   { enabled: false, from: null },
      office:    { enabled: false, from: null },
    },
    shortDescription: 'Moderní coworking s podcast studiem a 1Gb/s internetem v srdci Budějovic.',
    website: 'https://www.budehub.cz',
  }),
  createCoworking('cw_coworking_tchk', 'Coworking TCHK', 'Hradec Králové', 'Královéhradecký kraj', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer'],
    capacity: 30,
    areaM2: 550,
  
    photos: [{ id: 'cw_coworking_tchk_p1', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80', caption: 'Coworking TCHK', isPrimary: true }],
  
    address: 'Eliščino nábřeží 842',
    zipCode: '500 02',
    shortDescription: 'Coworking v Technologickém centru Hradec Králové pro startupy a začínající podnikatele.',
    website: 'https://www.tchk.cz/coworking',
  }),
  createCoworking('cw_bio_central', 'Bio Central', 'Hradec Králové', 'Královéhradecký kraj', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer', 'events'],
    capacity: 35,
    areaM2: 600,
  
    photos: [{ id: 'cw_bio_central_p1', url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80', caption: 'Bio Central', isPrimary: true }],
  
    address: 'třída Karla IV. 774',
    zipCode: '500 02',
    shortDescription: 'Kulturní centrum Bio Central s kavárnou a coworkingovou zónou v Hradci Králové.',
    website: 'https://www.biocentral.cz',
  }),
  createCoworking('cw_cowork_cityhub_jihlava', 'COWORK:S CityHUB Jihlava', 'Jihlava', 'Kraj Vysočina', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer', 'reception'],
    capacity: 40,
    areaM2: 700,
  
    photos: [{ id: 'cw_cowork_cityhub_jihlava_p1', url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80', caption: 'COWORK:S CityHUB Jihlava', isPrimary: true }],
  
    address: 'Úzká 1',
    zipCode: '586 01',
    prices: {
      hourly:    { enabled: false,  from: null   },
      dayPass:   { enabled: true,  from: 250  },
      openSpace: { enabled: false,  from: null },
      fixDesk:   { enabled: false, from: null },
      office:    { enabled: false, from: null },
    },
    shortDescription: 'CityHUB Jihlava – flexibilní coworking v centru krajského města Vysočiny.',
    website: 'https://www.hubjihlava.cz',
  }),
  createCoworking('cw_yottabe_jihlava', 'Yottabe Space', 'Jihlava', 'Kraj Vysočina', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer', 'events'],
    capacity: 30,
    areaM2: 550,
  
    photos: [{ id: 'cw_yottabe_jihlava_p1', url: 'https://images.unsplash.com/photo-1572025442646-866d16c84a54?auto=format&fit=crop&w=800&q=80', caption: 'Yottabe Space', isPrimary: true }],
  
    address: 'Matky Boží 1186/1',
    zipCode: '586 01',
    shortDescription: 'Multifunkční prostor na Masarykově náměstí s coworkingem, zasedacími místnostmi a podcast studiem.',
    website: 'https://www.yottabespace.cz',
  }),
  createCoworking('cw_kanov', 'Kanov', 'Karlovy Vary', 'Karlovarský kraj', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer'],
    capacity: 25,
    areaM2: 450,
  
    photos: [{ id: 'cw_kanov_p1', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80', caption: 'Kanov', isPrimary: true }],
  
    address: 'Závodní 278',
    zipCode: '360 18',
    shortDescription: 'Podnikatelský inkubátor KANOV v Tašovicích s kancelářskými a výrobními prostory.',
    website: 'https://www.kanov.cz',
  }),
  createCoworking('cw_lipo_ink', 'Lipo.ink', 'Liberec', 'Liberecký kraj', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer', 'workshop_tools'],
    capacity: 35,
    areaM2: 650,
  
    photos: [{ id: 'cw_lipo_ink_p1', url: 'https://images.unsplash.com/photo-1416339134316-0e91dc9ded92?auto=format&fit=crop&w=800&q=80', caption: 'Lipo.ink', isPrimary: true }],
  
    address: 'U Jezu 525/4',
    zipCode: '460 01',
    shortDescription: 'Kreativní a komunitní coworking v centru Liberce s pravidelným programem.',
    website: 'https://lipo.ink',
  }),
  createCoworking('cw_teamwork', 'TeamWork', 'Liberec', 'Liberecký kraj', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer'],
    capacity: 30,
    areaM2: 550,
  
    photos: [{ id: 'cw_teamwork_p1', url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80', caption: 'TeamWork', isPrimary: true }],
  
    address: 'náměstí Dr. E. Beneše 23',
    zipCode: '460 01',
    shortDescription: 'TeamWork Liberec – coworking v centru Liberce s vysokými stropy a designovým interiérem.',
    website: 'https://coworking-liberec.cz',
  }),
  createCoworking('cw_hub_mb', 'Hub MB', 'Mladá Boleslav', 'Středočeský kraj', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer', 'reception'],
    capacity: 35,
    areaM2: 600,
  
    photos: [{ id: 'cw_hub_mb_p1', url: 'https://images.unsplash.com/photo-1564069114553-7215e1ff1890?auto=format&fit=crop&w=800&q=80', caption: 'Hub MB', isPrimary: true }],
  
    address: 'tř. Václava Klementa 601/13',
    zipCode: '293 01',
    shortDescription: 'HUB MB – komunita a coworking v centru Mladé Boleslavi pro pozitivní změnu regionu.',
    website: 'https://hubmb.cz',
  }),
  createCoworking('cw_vault_42', 'Vault 42', 'Olomouc', 'Olomoucký kraj', {
    website: 'https://www.vault42.cz',
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer', '24h_access'],
    capacity: 40,
    areaM2: 750,
  
    photos: [{ id: 'cw_vault_42_p1', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80', caption: 'Vault 42', isPrimary: true }],
  
    address: 'Koželužská 945/31',
    zipCode: '779 00',
    shortDescription: 'Industriální coworking ve Vault 42 v Olomouci s kreativní atmosférou.',
  }),
  createCoworking('cw_coworking_olomouc', 'Coworking Olomouc', 'Olomouc', 'Olomoucký kraj', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer', 'reception'],
    capacity: 35,
    areaM2: 650,
  
    photos: [{ id: 'cw_coworking_olomouc_p1', url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80', caption: 'Coworking Olomouc', isPrimary: true }],
  
    address: 'Jakoubka ze Stříbra 44',
    zipCode: '779 00',
    shortDescription: 'Coworking Olomouc – sdílené kanceláře v centru Olomouce s komunitní atmosférou.',
    website: 'https://www.coworkingolomouc.cz',
  }),
  createCoworking('cw_telegraph_hub', 'Telegraph Hub', 'Olomouc', 'Olomoucký kraj', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer', 'events'],
    capacity: 30,
    areaM2: 550,
  
    photos: [{ id: 'cw_telegraph_hub_p1', url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80', caption: 'Telegraph Hub', isPrimary: true }],
  
    address: 'Jungmannova 800/3',
    zipCode: '779 00',
    prices: {
      hourly:    { enabled: false,  from: null   },
      dayPass:   { enabled: true,  from: 450  },
      openSpace: { enabled: false,  from: null },
      fixDesk:   { enabled: false, from: null },
      office:    { enabled: false, from: null },
    },
    shortDescription: 'Elegantní Telegraph Hub v centru Olomouce s coworkingem a zasedacími místnostmi.',
    website: 'https://telegraph.cz/coworking',
  }),
  createCoworking('cw_ohub', 'Ohub', 'Olomouc', 'Olomoucký kraj', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer'],
    capacity: 25,
    areaM2: 450,
  
    photos: [{ id: 'cw_ohub_p1', url: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=800&q=80', caption: 'Ohub', isPrimary: true }],
  
    address: 'Wellnerova 1215/1',
    zipCode: '779 00',
    shortDescription: 'OHUB – kanceláře, zasedačky a coworking v moderním BEA Centru Olomouc.',
    website: 'https://ohub.cz',
  }),
  createCoworking('cw_element_coworking', 'Element Coworking', 'Olomouc', 'Olomoucký kraj', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer'],
    capacity: 20,
    areaM2: 400,
  
    photos: [{ id: 'cw_element_coworking_p1', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80', caption: 'Element Coworking', isPrimary: true }],
  
    address: '17. listopadu 1230/8a',
    zipCode: '779 00',
    shortDescription: 'Element Coworking v Envelopa Hubu – sdílený prostor Univerzity Palackého v Olomouci.',
    website: 'https://www.elementcoworking.cz',
  }),
  createCoworking('cw_freework_envelopa', 'Freework Envelopa', 'Olomouc', 'Olomoucký kraj', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer', 'events'],
    capacity: 30,
    areaM2: 550,
  
    photos: [{ id: 'cw_freework_envelopa_p1', url: 'https://images.unsplash.com/photo-1416339134316-0e91dc9ded92?auto=format&fit=crop&w=800&q=80', caption: 'Freework Envelopa', isPrimary: true }],
  
    address: 'tř. Kosmonautů 1221/2a',
    zipCode: '779 00',
    shortDescription: 'Kancelářský coworking FreeWork v moderním administrativním centru Envelopa v Olomouci.',
    website: 'https://www.freeworkenvelopa.cz',
  }),
  createCoworking('cw_p_pink', 'P-PINK', 'Pardubice', 'Pardubický kraj', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer', 'reception'],
    capacity: 35,
    areaM2: 650,
  
    photos: [{ id: 'cw_p_pink_p1', url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=80', caption: 'P-PINK', isPrimary: true }],
  
    address: 'Jana Palacha 363',
    zipCode: '530 02',
    prices: {
      hourly:    { enabled: false,  from: null   },
      dayPass:   { enabled: true,  from: 80  },
      openSpace: { enabled: false,  from: null },
      fixDesk:   { enabled: false, from: null },
      office:    { enabled: false, from: null },
    },
    shortDescription: 'Pardubický podnikatelský inkubátor s flexibilním coworkingem a multimediálním studiem.',
    website: 'https://p-pink.cz',
  }),
  createCoworking('cw_druzstvo_coworking', 'Družstvo: Coworking v Domě služeb', 'Pardubice', 'Pardubický kraj', {
    website: 'https://www.dum-sluzeb.cz/coworking',
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer'],
    capacity: 30,
    areaM2: 550,
  
    photos: [{ id: 'cw_druzstvo_coworking_p1', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80', caption: 'Družstvo: Coworking v Domě služeb', isPrimary: true }],
  
    address: 'Palackého 68',
    zipCode: '530 01',
    shortDescription: 'Družstvo – komunitní coworking v Domě služeb v centru Pardubic.',
  }),
  createCoworking('cw_sit_port', 'SIT Port', 'Plzeň', 'Plzeňský kraj', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer', 'reception'],
    capacity: 45,
    areaM2: 800,
  
    photos: [{ id: 'cw_sit_port_p1', url: 'https://images.unsplash.com/photo-1547496502-affa22d38842?auto=format&fit=crop&w=800&q=80', caption: 'SIT Port', isPrimary: true }],
  
    address: 'Technologická 2',
    zipCode: '301 00',
    shortDescription: 'SIT Port Cowork v TechTower – inovační hub pro tech komunitu v Plzni.',
    website: 'https://sitport.cz',
  }),
  createCoworking('cw_techheaven_hub', 'TechHeaven HUB', 'Plzeň', 'Plzeňský kraj', {
    website: 'https://techheaven.org',
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer', 'events'],
    capacity: 40,
    areaM2: 700,
  
    photos: [{ id: 'cw_techheaven_hub_p1', url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80', caption: 'TechHeaven HUB', isPrimary: true }],
  
    address: 'Rooseveltova 16',
    zipCode: '301 00',
    shortDescription: 'TechHeaven HUB – technologický hub a coworking pro inovátory v Plzni.',
  }),
  createCoworking('cw_kolektiv_hub', 'Kolektiv Hub', 'Plzeň', 'Plzeňský kraj', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer'],
    capacity: 35,
    areaM2: 650,
  
    photos: [{ id: 'cw_kolektiv_hub_p1', url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80', caption: 'Kolektiv Hub', isPrimary: true }],
  
    address: 'Kopeckého sady 329',
    zipCode: '301 00',
    shortDescription: 'Kolektiv Hub – coworking v zelených Kopeckého sadech v centru Plzně.',
    website: 'https://www.kolektivhub.cz',
  }),
  createCoworking('cw_strom_offices', 'Strom Offices', 'Plzeň', 'Plzeňský kraj', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer', 'parking'],
    capacity: 40,
    areaM2: 700,
  
    photos: [{ id: 'cw_strom_offices_p1', url: 'https://images.unsplash.com/photo-1573167243872-43c6433b9d40?auto=format&fit=crop&w=800&q=80', caption: 'Strom Offices', isPrimary: true }],
  
    address: 'Koželužská 3034/1',
    zipCode: '301 00',
    prices: {
      hourly:    { enabled: false,  from: null   },
      dayPass:   { enabled: true,  from: 200  },
      openSpace: { enabled: true,  from: 1690 },
      fixDesk:   { enabled: false, from: null },
      office:    { enabled: false, from: null },
    },
    shortDescription: 'STROM offices – chytrá budova s coworkingem, parkováním a 24/7 přístupem v Plzni.',
    website: 'https://www.strom-offices.cz',
  }),
  createCoworking('cw_bic_plzen', 'BIC', 'Plzeň', 'Plzeňský kraj', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer', 'reception'],
    capacity: 50,
    areaM2: 900,
  
    photos: [{ id: 'cw_bic_plzen_p1', url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80', caption: 'BIC', isPrimary: true }],
  
    address: 'Riegrova 1',
    zipCode: '301 00',
    prices: {
      hourly:    { enabled: false,  from: null   },
      dayPass:   { enabled: false,  from: null  },
      openSpace: { enabled: true,  from: 3000 },
      fixDesk:   { enabled: false, from: null },
      office:    { enabled: false, from: null },
    },
    shortDescription: 'Podnikatelské a inovační centrum BIC Plzeň s coworkingem a kancelářemi.',
    website: 'https://www.bic.cz',
  }),
  createCoworking('cw_hub_hax', 'hub HAX', 'Zlín', 'Zlínský kraj', {
    website: 'https://www.facebook.com/hubhax',
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer', 'events'],
    capacity: 35,
    areaM2: 650,
  
    photos: [{ id: 'cw_hub_hax_p1', url: 'https://images.unsplash.com/photo-1572025442646-866d16c84a54?auto=format&fit=crop&w=800&q=80', caption: 'hub HAX', isPrimary: true }],
  
    address: 'Dlouhá 497',
    zipCode: '760 01',
    shortDescription: 'HAX – kreativní hub pro designery, marketéry a digitální profesionály ve Zlíně.',
  }),
  createCoworking('cw_zlin_hygge', 'Zlin.Hygge', 'Zlín', 'Zlínský kraj', {
    amenities: ['wifi', 'kitchen', 'cafe', 'printer'],
    capacity: 20,
    areaM2: 400,
  
    photos: [{ id: 'cw_zlin_hygge_p1', url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80', caption: 'Zlin.Hygge', isPrimary: true }],
  
    address: 'Štefánikova 5497',
    zipCode: '760 01',
    shortDescription: 'Zlín.Hygge – flexibilní kanceláře a coworking v centru Zlína.',
    website: 'https://zlin.hygge.cz',
  }),
  createCoworking('cw_retreat_beskydy', 'Retreat.cz', 'Beskydy', 'Moravskoslezský kraj', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer'],
    capacity: 20,
    areaM2: 400,
  
    photos: [{ id: 'cw_retreat_beskydy_p1', url: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=800&q=80', caption: 'Retreat.cz', isPrimary: true }],
  
    address: 'Hlavní 162',
    zipCode: '739 14',
    shortDescription: 'Retreat.cz – klidný coworking a ubytování v inspirativním prostředí Beskyd.',
    website: 'https://retreat.cz',
  }),
  createCoworking('cw_coworking_bobr', 'CoWorking BoBr', 'Brandýs nad Labem', 'Středočeský kraj', {
    website: 'https://www.coworkingbobr.cz',
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer'],
    capacity: 25,
    areaM2: 450,
  
    photos: [{ id: 'cw_coworking_bobr_p1', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80', caption: 'CoWorking BoBr', isPrimary: true }],
  
    address: 'Masarykovo náměstí 1',
    zipCode: '250 01',
    shortDescription: 'CoWorking BoBr – sdílená kancelář v Brandýse nad Labem-Staré Boleslavi.',
  }),
  createCoworking('cw_coworking_cesky_tesin', 'Co-working Český Těšín', 'Český Těšín', 'Moravskoslezský kraj', {
    website: 'https://www.facebook.com/coworkvtesine/',
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer'],
    capacity: 20,
    areaM2: 380,
  
    photos: [{ id: 'cw_coworking_cesky_tesin_p1', url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80', caption: 'Co-working Český Těšín', isPrimary: true }],
  
    address: 'Hlavní třída 130',
    zipCode: '737 01',
    shortDescription: 'Co-working Český Těšín – sdílená kancelář v pohraničním městě na hranici s Polskem.',
  }),
  createCoworking('cw_cowo_libre', 'Cowo Libre', 'Frýdek-Místek', 'Moravskoslezský kraj', {
    website: 'https://www.facebook.com/events/1151358466033850/1151358469367183',
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer'],
    capacity: 25,
    areaM2: 450,
  
    photos: [{ id: 'cw_cowo_libre_p1', url: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=800&q=80', caption: 'Cowo Libre', isPrimary: true }],
  
    address: 'Palackého 1279',
    zipCode: '738 01',
    shortDescription: 'Cowo Libre – přátelský coworking ve Frýdku-Místku pro místní freelancery a podnikatele.',
  }),
  createCoworking('cw_centrum_podpory_podnikani', 'Centrum pro podporu podnikání', 'Havířov', 'Moravskoslezský kraj', {
    website: 'https://www.centrumpropodnikani.cz/sluzby-centra/podnajem-prostor/',
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer'],
    capacity: 30,
    areaM2: 550,
  
    photos: [{ id: 'cw_centrum_podpory_podnikani_p1', url: 'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&w=800&q=80', caption: 'Centrum pro podporu podnikání', isPrimary: true }],
  
    address: 'Svornosti 2',
    zipCode: '736 01',
    shortDescription: 'Centrum pro podporu podnikání v Havířově s coworkingem a mentorskými programy.',
  }),
  createCoworking('cw_hubbr', 'Hubbr', 'Havlíčkův Brod', 'Kraj Vysočina', {
    website: 'https://www.hubbr.cz',
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer'],
    capacity: 25,
    areaM2: 450,
  
    photos: [{ id: 'cw_hubbr_p1', url: 'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?auto=format&fit=crop&w=800&q=80', caption: 'Hubbr', isPrimary: true }],
  
    address: 'Havlíčkovo náměstí 189',
    zipCode: '580 01',
    shortDescription: 'Hubbr – coworkingový prostor v Havlíčkově Brodě pro lokální komunitu podnikatelů.',
  }),
  createCoworking('cw_kanov_cheb', 'Kanov', 'Cheb', 'Karlovarský kraj', {
    website: 'https://www.kanov.cz/coworking/',
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer'],
    capacity: 20,
    areaM2: 400,
  
    photos: [{ id: 'cw_kanov_cheb_p1', url: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=800&q=80', caption: 'Kanov', isPrimary: true }],
  
    address: 'Dragounská 2268/4',
    zipCode: '350 02',
    shortDescription: 'Kanov Cheb – podnikatelský inkubátor a coworking v Chebu.',
  }),
  createCoworking('cw_cowork_jes', 'Cowork Jes', 'Jeseník', 'Olomoucký kraj', {
    website: 'https://coworkjes.cz',
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer'],
    capacity: 20,
    areaM2: 400,
  
    photos: [{ id: 'cw_cowork_jes_p1', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80', caption: 'Cowork Jes', isPrimary: true }],
  
    address: 'Dukelská 1240/21',
    zipCode: '790 01',
    shortDescription: 'Cowork Jes – sdílená kancelář v Jeseníku pro místní podnikatele a vzdálené pracovníky.',
  }),
  createCoworking('cw_businessgate', 'BusinessGate', 'Karviná', 'Moravskoslezský kraj', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer'],
    capacity: 25,
    areaM2: 450,
  
    photos: [{ id: 'cw_businessgate_p1', url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80', caption: 'BusinessGate', isPrimary: true }],
  
    address: 'Poštovní 615/9',
    zipCode: '733 01',
    shortDescription: 'BusinessGate – podpora podnikání a coworking ve Fryštátě v Karviné.',
    website: 'https://www.businessgate.cz',
  }),
  createCoworking('cw_coworking_kolin', 'Coworking Kolín', 'Kolín', 'Středočeský kraj', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer'],
    capacity: 30,
    areaM2: 550,
  
    photos: [{ id: 'cw_coworking_kolin_p1', url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80', caption: 'Coworking Kolín', isPrimary: true }],
  
    address: 'Kutnohorská 40',
    zipCode: '280 02',
    shortDescription: 'Přátelský coworking v Kolíně se zaměřením na komunitu a podnikatelské snídaně.',
    website: 'https://coworkingkolin.cz',
  }),
  createCoworking('cw_volny_stul', 'Volný stůl', 'Kolín', 'Středočeský kraj', {
    amenities: ['wifi', 'kitchen', 'printer'],
    capacity: 20,
    areaM2: 400,
  
    photos: [{ id: 'cw_volny_stul_p1', url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80', caption: 'Volný stůl', isPrimary: true }],
  
    address: 'Politických vězňů 10',
    zipCode: '280 02',
    prices: {
      hourly:    { enabled: false,  from: null   },
      dayPass:   { enabled: true,  from: 300  },
      openSpace: { enabled: false,  from: null },
      fixDesk:   { enabled: false, from: null },
      office:    { enabled: false, from: null },
    },
    shortDescription: 'Volný stůl Kolín – flexibilní coworking nedaleko nádraží v Kolíně.',
    website: 'https://volnystul.cz',
  }),
  createCoworking('cw_litohub', 'Litohub', 'Litoměřice', 'Ústecký kraj', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer'],
    capacity: 25,
    areaM2: 450,
  
    photos: [{ id: 'cw_litohub_p1', url: 'https://images.unsplash.com/photo-1572025442646-866d16c84a54?auto=format&fit=crop&w=800&q=80', caption: 'Litohub', isPrimary: true }],
  
    address: 'Mírové náměstí 167/36',
    zipCode: '412 01',
    shortDescription: 'LitoHUB – coworking, studio a eventy v historickém centru Litoměřic.',
    website: 'https://litohub.cz',
  }),
  createCoworking('cw_kocarovna', 'Kočárovna', 'Litomyšl', 'Pardubický kraj', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer'],
    capacity: 20,
    areaM2: 400,
  
    photos: [{ id: 'cw_kocarovna_p1', url: 'https://images.unsplash.com/photo-1453928582365-b6ad33cbcf64?auto=format&fit=crop&w=800&q=80', caption: 'Kočárovna', isPrimary: true }],
  
    address: 'Jiráskova 133',
    zipCode: '570 01',
    shortDescription: 'Kočárovna Litomyšl – unikátní coworking na zámeckém areálu zapsaném na seznamu UNESCO.',
    website: 'https://www.zamecke-navrsi.cz/cs/m-77-coworking-kocarovna',
  }),
  createCoworking('cw_bridge_714', 'Bridge 714', 'Most', 'Ústecký kraj', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer'],
    capacity: 25,
    areaM2: 450,
  
    photos: [{ id: 'cw_bridge_714_p1', url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80', caption: 'Bridge 714', isPrimary: true }],
  
    address: 'U Stadionu 714/30',
    zipCode: '434 01',
    shortDescription: 'Bridge 714 – inovační a vzdělávací centrum v Mostě s coworkingem a moderními technologiemi.',
    website: 'https://www.bridge714.cz',
  }),
  createCoworking('cw_coworking_most_como', 'Coworking Most – COMO', 'Most', 'Ústecký kraj', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer'],
    capacity: 30,
    areaM2: 550,
  
    photos: [{ id: 'cw_coworking_most_como_p1', url: 'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?auto=format&fit=crop&w=800&q=80', caption: 'Coworking Most – COMO', isPrimary: true }],
  
    address: 'tř. Budovatelů 2830/44',
    zipCode: '434 01',
    shortDescription: 'Coworking Most COMO – flexibilní pracovní prostory a komunita v centru Mostu.',
    website: 'https://www.coworking-most.cz',
  }),
  createCoworking('cw_lovecowork', 'LoveCoWork', 'Opava', 'Moravskoslezský kraj', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer'],
    capacity: 25,
    areaM2: 450,
  
    photos: [{ id: 'cw_lovecowork_p1', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80', caption: 'LoveCoWork', isPrimary: true }],
  
    address: 'Na Rybníčku 521/56',
    zipCode: '746 01',
    prices: {
      hourly:    { enabled: false,  from: null   },
      dayPass:   { enabled: true,  from: 200  },
      openSpace: { enabled: false,  from: null },
      fixDesk:   { enabled: false, from: null },
      office:    { enabled: false, from: null },
    },
    shortDescription: 'LoveCoWork – jediný coworking v Opavě s otevřeným prostorem a zasedačkou pro 30 lidí.',
    website: 'https://lovecowork.cz',
  }),
  createCoworking('cw_nase_hnizdo', 'Naše hnízdo', 'Orlová', 'Moravskoslezský kraj', {
    website: 'https://www.nasehnizdo.cz',
    amenities: ['wifi', 'kitchen', 'printer'],
    capacity: 20,
    areaM2: 400,
  
    photos: [{ id: 'cw_nase_hnizdo_p1', url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80', caption: 'Naše hnízdo', isPrimary: true }],
  
    address: 'Masarykova třída 1227/4',
    zipCode: '735 11',
    shortDescription: 'Naše hnízdo – komunitní centrum a coworking pro rodiče v Orlové.',
  }),
  createCoworking('cw_blaho_work', 'Blaho&work', 'Ostrov', 'Karlovarský kraj', {
    website: 'https://blaho.work',
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer'],
    capacity: 20,
    areaM2: 400,
  
    photos: [{ id: 'cw_blaho_work_p1', url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80', caption: 'Blaho&work', isPrimary: true }],
  
    address: 'Klínovecká 1432',
    zipCode: '363 01',
    shortDescription: 'Blaho&work – kombinace wellness a coworkingového prostoru v Ostrově.',
  }),
  createCoworking('cw_prstework', 'ProstěWork', 'Prostějov', 'Olomoucký kraj', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer'],
    capacity: 25,
    areaM2: 450,
  
    photos: [{ id: 'cw_prstework_p1', url: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=800&q=80', caption: 'ProstěWork', isPrimary: true }],
  
    address: 'Dukelská brána 213/4',
    zipCode: '796 01',
    shortDescription: 'ProstěWork – sdílená kancelář pro klidnou práci na projektech v Prostějově.',
    website: 'https://prostework.cz',
  }),
  createCoworking('cw_in_hub', 'IN-HUB', 'Přerov', 'Olomoucký kraj', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer'],
    capacity: 25,
    areaM2: 450,
  
    photos: [{ id: 'cw_in_hub_p1', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80', caption: 'IN-HUB', isPrimary: true }],
  
    address: 'Bratrská 2',
    zipCode: '750 02',
    shortDescription: 'IN-HUB Přerov – inovační hub s coworkingem, konferenčními sály a kreativní dílnou.',
    website: 'https://inhubprerov.eu',
  }),
  createCoworking('cw_cwrk_jzd', 'Cwrk JzD', 'Roudnice nad Labem', 'Středočeský kraj', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer'],
    capacity: 20,
    areaM2: 400,
  
    photos: [{ id: 'cw_cwrk_jzd_p1', url: 'https://images.unsplash.com/photo-1416339134316-0e91dc9ded92?auto=format&fit=crop&w=800&q=80', caption: 'Cwrk JzD', isPrimary: true }],
  
    address: 'náměstí Jana z Dražic 103',
    zipCode: '413 01',
    shortDescription: 'Cwrk JzD – první coworking v Roudnici nad Labem provozovaný neziskovou organizací.',
    website: 'https://www.cwrkjzd.cz',
  }),
  createCoworking('cw_cowork_svitavy', 'Cowork', 'Svitavy', 'Pardubický kraj', {
    website: 'https://m.svitavy.cz/2_3484_cowork-svitavy/',
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer'],
    capacity: 20,
    areaM2: 400,
  
    photos: [{ id: 'cw_cowork_svitavy_p1', url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=80', caption: 'Cowork', isPrimary: true }],
  
    address: 'náměstí Míru 96/1',
    zipCode: '568 02',
    shortDescription: 'Cowork Svitavy – sdílená kancelář a studovna v centru Svitav.',
  }),
  createCoworking('cw_cowosedlice', 'Cowosedlice', 'Teplice', 'Ústecký kraj', {
    website: 'https://www.cowosedlice.cz',
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer'],
    capacity: 25,
    areaM2: 450,
  
    photos: [{ id: 'cw_cowosedlice_p1', url: 'https://images.unsplash.com/photo-1453928582365-b6ad33cbcf64?auto=format&fit=crop&w=800&q=80', caption: 'Cowosedlice', isPrimary: true }],
  
    address: 'náměstí Svobody 1',
    zipCode: '415 01',
    shortDescription: 'Cowosedlice – komunitní coworkingový prostor v Teplicích.',
  }),
  createCoworking('cw_sdilene_kancelar_teplice', 'Sdílené kanceláře Teplice', 'Teplice', 'Ústecký kraj', {
    website: 'https://sdilenekancelareteplice.cz',
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer'],
    capacity: 30,
    areaM2: 550,
  
    photos: [{ id: 'cw_sdilene_kancelar_teplice_p1', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80', caption: 'Sdílené kanceláře Teplice', isPrimary: true }],
  
    address: 'Masarykova 357',
    zipCode: '415 01',
    shortDescription: 'Sdílené kanceláře Teplice – flexibilní coworking v centru Teplic.',
  }),
  createCoworking('cw_hnizdo_uherske_hradiste', 'Hnízdo', 'Uherské Hradiště', 'Zlínský kraj', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer'],
    capacity: 20,
    areaM2: 400,
  
    photos: [{ id: 'cw_hnizdo_uherske_hradiste_p1', url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80', caption: 'Hnízdo', isPrimary: true }],
  
    address: 'Studentské náměstí 1531',
    zipCode: '686 01',
    shortDescription: 'Hnízdo UH – coworkingové a komunitní centrum na Studentském náměstí.',
    website: 'https://www.hnizdouh.cz',
  }),
  createCoworking('cw_hub_123', 'HUB 123', 'Uherské Hradiště', 'Zlínský kraj', {
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer'],
    capacity: 25,
    areaM2: 450,
  
    photos: [{ id: 'cw_hub_123_p1', url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=80', caption: 'HUB 123', isPrimary: true }],
  
    address: 'Mariánské náměstí 123',
    zipCode: '686 01',
    prices: {
      hourly:    { enabled: false,  from: null   },
      dayPass:   { enabled: false,  from: null  },
      openSpace: { enabled: true,  from: 1500 },
      fixDesk:   { enabled: false, from: null },
      office:    { enabled: false, from: null },
    },
    shortDescription: 'HUB 123 – kreativní hub a sdílená kancelář v centru Uherského Hradiště.',
    website: 'https://hub123.cz',
  }),
  createCoworking('cw_hopspot_cowork', 'Hopspot Cowork', 'Žatec', 'Ústecký kraj', {
    website: 'https://www.facebook.com/people/Hopspot-Cowork-Žatec/100095498621922/',
    amenities: ['wifi', 'meeting_rooms', 'kitchen', 'printer'],
    capacity: 25,
    areaM2: 450,
  
    photos: [{ id: 'cw_hopspot_cowork_p1', url: 'https://images.unsplash.com/photo-1573167243872-43c6433b9d40?auto=format&fit=crop&w=800&q=80', caption: 'Hopspot Cowork', isPrimary: true }],
  
    address: 'Chelčického nám. 6',
    zipCode: '438 01',
    shortDescription: 'Hopspot Cowork – coworking na historickém náměstí v Žatci s dílnou a 3D tiskárnami.',
  }),
];

export const eventsData: Event[] = [
  {
    id: 'evt_1',
    coworkingId: 'cw_node5',
    coworkingName: 'Node5',
    title: 'Networking pro startupery',
    description: 'Setkání zaměřené na networking mezi startupy a investory. Seznamte se s novými partnery a inspirujte se příběhy ostatních podnikatelů.',
    eventType: 'networking',
    startDate: '2026-04-15T18:00:00Z',
    endDate: '2026-04-15T20:00:00Z',
    isAllDay: false,
    maxAttendees: 50,
    price: 150,
    isFree: false,
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400',
    url: 'https://www.node5.cz/events/networking-startupery-2026',
  },
  {
    id: 'evt_2',
    coworkingId: 'cw_opero',
    coworkingName: 'Opero',
    title: 'Workshop - Digital Marketing',
    description: 'Intenzivní workshop zaměřený na moderní digitální marketing. Naučte se strategie SEO, sociální sítě a content marketing.',
    eventType: 'workshop',
    startDate: '2026-04-20T09:00:00Z',
    endDate: '2026-04-20T17:00:00Z',
    isAllDay: false,
    maxAttendees: 30,
    price: 890,
    isFree: false,
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400',
    url: 'https://opero.cz/workshop-digital-marketing-2026',
  },
  {
    id: 'evt_3',
    coworkingId: 'cw_node5',
    coworkingName: 'Node5',
    title: 'Python pro data science',
    description: 'Workshop zaměřený na práci s Pythonem v datové vědě. Praktické příklady s reálnými datovými sadami.',
    eventType: 'workshop',
    startDate: '2026-04-22T10:00:00Z',
    endDate: '2026-04-22T16:00:00Z',
    isAllDay: false,
    maxAttendees: 25,
    price: null,
    isFree: true,
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400',
  },
  {
    id: 'evt_4',
    coworkingId: 'cw_impact_hub_brno',
    coworkingName: 'Impact Hub Brno',
    title: 'Brno Tech Meetup',
    description: 'Pravidelné setkání tech komunity v Brně. Prezentace zajímavých projektů a znalostní výměna.',
    eventType: 'meetup',
    startDate: '2026-04-25T17:30:00Z',
    endDate: '2026-04-25T19:30:00Z',
    isAllDay: false,
    maxAttendees: 60,
    price: null,
    isFree: true,
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400',
    url: 'https://www.impacthub.cz/events/brno-tech-meetup-april-2026',
  },
  {
    id: 'evt_5',
    coworkingId: 'cw_microsoft_coworking',
    coworkingName: 'Microsoft Coworking Space',
    title: 'Azure Cloud Conference',
    description: 'Konference věnovaná cloudovým technologiím a Azure. Slyšte o nejnovějších trendech v cloud computingu.',
    eventType: 'conference',
    startDate: '2026-05-05T08:30:00Z',
    endDate: '2026-05-05T17:00:00Z',
    isAllDay: false,
    maxAttendees: 100,
    price: 1290,
    isFree: false,
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400',
    url: 'https://azure.microsoft.com/cs-cz/developer/events/azure-cloud-conference/',
  },
  {
    id: 'evt_6',
    coworkingId: 'cw_scott_weber',
    coworkingName: 'Scott.Weber',
    title: 'Community Afterwork Party',
    description: 'Neformální setkání komunity koworkingu. Skvělá příležitost k poznání kolegů v uvolněné atmosféře.',
    eventType: 'party',
    startDate: '2026-05-10T18:00:00Z',
    endDate: '2026-05-10T22:00:00Z',
    isAllDay: false,
    maxAttendees: null,
    price: null,
    isFree: true,
    imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400',
  },
  {
    id: 'evt_7',
    coworkingId: 'cw_brain_farm',
    coworkingName: 'Brain Farm',
    title: 'Jak na efektivní management',
    description: 'Workshop o best practices v řízení týmu a produktivitě. Praktické tipy od zkušených leaderů.',
    eventType: 'workshop',
    startDate: '2026-05-12T14:00:00Z',
    endDate: '2026-05-12T17:00:00Z',
    isAllDay: false,
    maxAttendees: 35,
    price: 450,
    isFree: false,
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400',
  },
  {
    id: 'evt_8',
    coworkingId: 'cw_impact_hub_ostrava',
    coworkingName: 'Impact Hub Ostrava',
    title: 'Startup Pitch Event',
    description: 'Startupy pitchují své nápady před investory. Možnost získat financování a mentoring.',
    eventType: 'networking',
    startDate: '2026-05-18T18:00:00Z',
    endDate: '2026-05-18T21:00:00Z',
    isAllDay: false,
    maxAttendees: 80,
    price: 200,
    isFree: false,
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400',
    url: 'https://www.impacthub.cz/events/startup-pitch-ostrava-2026',
  },
  {
    id: 'evt_9',
    coworkingId: 'cw_bic_plzen',
    coworkingName: 'BIC',
    title: 'UX/UI Design Workshop',
    description: 'Naučte se principy moderního designu. Praktické cvičení s reálnými projekty.',
    eventType: 'workshop',
    startDate: '2026-05-20T10:00:00Z',
    endDate: '2026-05-20T16:00:00Z',
    isAllDay: false,
    maxAttendees: 25,
    price: 590,
    isFree: false,
    imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400',
  },
  {
    id: 'evt_10',
    coworkingId: 'cw_clubco_praha',
    coworkingName: 'Clubco',
    title: 'Social Impact Meetup',
    description: 'Setkání pro ty, kteří chtějí dělat byznys s pozitivním dopadem. Inspirace a networking.',
    eventType: 'meetup',
    startDate: '2026-05-22T17:00:00Z',
    endDate: '2026-05-22T19:00:00Z',
    isAllDay: false,
    maxAttendees: 45,
    price: null,
    isFree: true,
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400',
  },
];

export const marketplaceData: MarketplaceListing[] = [
  {
    id: 'mlst_1',
    userId: 'usr_1',
    userName: 'Jan Novák',
    title: 'Hledám grafika na freelance projekty',
    description: 'Potřebuji zkušeného grafika na dlouhodobou spolupráci. Projekty jsou různorodé, od webů přes bannery až po tištěné materiály. Flexibilní závazkům, oceňuji proaktivní přístup.',
    category: 'job_offer',
    tags: ['grafika', 'design', 'freelance', 'web'],
    price: null,
    priceType: 'negotiable',
    location: 'Praha',
    isActive: true,
    contactEmail: 'jan@example.com',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mlst_2',
    userId: 'usr_2',
    userName: 'Anna Svobodová',
    title: 'UI/UX Designer - hledám práci',
    description: 'Zkušená UI/UX designerka s 5 lety zkušeností. Specialista na mobile app design a responsive web design. Hledám zajímavý projekt nebo pozici v startup.',
    category: 'job_seeking',
    tags: ['design', 'ui', 'ux', 'mobile', 'startup'],
    price: 45000,
    priceType: 'fixed',
    location: 'Brno',
    isActive: true,
    contactEmail: 'anna.svobodova@example.com',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mlst_3',
    userId: 'usr_3',
    userName: 'Pavel Kovář',
    title: 'Konzultace v oblastech SEO a SEM',
    description: 'Nabízím konzultace a koučování v SEO, SEM a general marketing strategii. Pomáhám firmám zvyšovat jejich online viditelnost a generovat leads. Prvních 30 minut bezplatně.',
    category: 'service_offer',
    tags: ['seo', 'sem', 'marketing', 'konzultace', 'coaching'],
    price: 1000,
    priceType: 'hourly',
    location: 'Praha',
    isActive: true,
    contactEmail: 'pavel.kovar@example.com',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mlst_4',
    userId: 'usr_4',
    userName: 'Marie Dvořáková',
    title: 'Hledám copywritera na projekt',
    description: 'Potřebuji zkušeného copywritera na náš e-commerce projekt. Jde o psaní produktových popisů, SEO texty a marketing copy. Čeština na vysoké úrovni, kreativita a porozumění e-commerce jsou nutností.',
    category: 'service_seeking',
    tags: ['copywriting', 'e-commerce', 'texty', 'seo'],
    price: 50,
    priceType: 'fixed',
    location: 'Ostrava',
    isActive: true,
    contactEmail: 'marie.dvorakova@example.com',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mlst_5',
    userId: 'usr_5',
    userName: 'Tomáš Svoboda',
    title: 'Kancelářský nábytek k prodeji',
    description: 'Prodávám kvalitní kancelářský nábytek z likvidace kanceláře. 10 kancelářských židlí, 5 psacích stolů, regály a skříně. Vše ve velmi dobrém stavu. Možnost prohlídky v Praze.',
    category: 'item_for_sale',
    tags: ['nábytek', 'kanceláří', 'židle', 'stoly', 'regály'],
    price: 25000,
    priceType: 'fixed',
    location: 'Praha',
    isActive: true,
    contactEmail: 'tomas.svoboda@example.com',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mlst_6',
    userId: 'usr_6',
    userName: 'Zuzana Králová',
    title: 'Hledám Second Hand MacBook Pro',
    description: 'Hledám kvalitní MacBook Pro, minimálně z roku 2018. Ideálně 13" s 512GB. Budu rád za nabídky s fotkami a detailními informacemi. Můžeme se domluvit na ceně.',
    category: 'item_wanted',
    tags: ['macbook', 'notebook', 'apple', 'second-hand'],
    price: 30000,
    priceType: 'negotiable',
    location: 'Brno',
    isActive: true,
    contactEmail: 'zuzana.kralova@example.com',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mlst_7',
    userId: 'usr_7',
    userName: 'David Kučera',
    title: 'Junior Developer (React) - nábor',
    description: 'Hledáme junior React developera do našeho týmu. Ideální kandidát má základy JavaScriptu, Docker a Git. Nabízíme mentoring, flexibilní pracovní dobu a zajímavé projekty. Možnost remote práce.',
    category: 'job_offer',
    tags: ['react', 'javascript', 'developer', 'junior', 'startup'],
    price: 35000,
    priceType: 'fixed',
    location: 'Praha',
    isActive: true,
    contactEmail: 'david.kucera@example.com',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mlst_8',
    userId: 'usr_8',
    userName: 'Petra Adamová',
    title: 'Pronájem kancelářských prostor',
    description: 'Pronajímáme krásné kancelářské prostory v centru Brna. 3 samostatné místnosti, společná kuchyňka, parkování. Ideální pro malý tým nebo více freelancerů. Krátké lhůty pronájmu možné.',
    category: 'service_offer',
    tags: ['pronájem', 'kanceláře', 'brno', 'prostor'],
    price: 12000,
    priceType: 'fixed',
    location: 'Brno',
    isActive: true,
    contactEmail: 'petra.adamova@example.com',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Helper functions for filtering and organizing data
export const getCitiesWithCount = () => {
  const cityCount: Record<string, number> = {};
  coworkingsData.forEach((cw) => {
    cityCount[cw.city] = (cityCount[cw.city] || 0) + 1;
  });
  return Object.entries(cityCount)
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count);
};

/** Score how complete a coworking profile is (higher = more complete) */
function profileCompleteness(cw: CoworkingSpace): number {
  let score = 0;
  if (cw.address)                          score += 2;
  if (cw.website)                          score += 2;
  if (cw.photos && cw.photos.length > 0)   score += 3;
  if (cw.photos && cw.photos.length >= 3)  score += 1;
  if (cw.shortDescription && cw.shortDescription.length > 40) score += 1;
  if (cw.description && cw.description.length > 100)          score += 1;
  if (cw.phone)                            score += 1;
  if (cw.email)                            score += 1;
  if (cw.capacity)                         score += 1;
  if (cw.areaM2)                           score += 1;
  if (cw.amenities && cw.amenities.length >= 4) score += 2;
  const p = cw.prices;
  const hasAnyPrice = p && (
    p.hourly?.enabled || p.dayPass?.enabled || p.openSpace?.enabled ||
    p.fixDesk?.enabled || p.office?.enabled
  );
  if (hasAnyPrice)                         score += 2;
  return score;
}

export const getFeaturedCoworkings = () => {
  // Tier 1: zvýrazněné (isFeatured)
  const tier1 = coworkingsData.filter((cw) => cw.isFeatured);
  const tier1Ids = new Set(tier1.map((cw) => cw.id));

  // Tier 2: ověřené, ale ne zvýrazněné
  const tier2 = coworkingsData.filter((cw) => !tier1Ids.has(cw.id) && cw.isVerified);
  const tier2Ids = new Set(tier2.map((cw) => cw.id));

  // Tier 3: mají speciální nabídku, ale nejsou ve tier1/2
  const tier3 = coworkingsData.filter(
    (cw) => !tier1Ids.has(cw.id) && !tier2Ids.has(cw.id) && (cw as unknown as Record<string, unknown>).specialDeal && ((cw as unknown as { specialDeal?: { enabled?: boolean } }).specialDeal?.enabled)
  );
  const tier3Ids = new Set(tier3.map((cw) => cw.id));

  // Tier 4: zbytek — náhodně zamíchaný
  const rest = coworkingsData.filter(
    (cw) => !tier1Ids.has(cw.id) && !tier2Ids.has(cw.id) && !tier3Ids.has(cw.id)
  );
  const shuffled = rest.slice().sort(() => Math.random() - 0.5);

  // Max 16 celkem (4×4 na desktopu)
  return [...tier1, ...tier2, ...tier3, ...shuffled].slice(0, 16);
};

export const getUpcomingEvents = () => {
  return eventsData
    .filter((e) => new Date(e.startDate) > new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
};

export const getLatestMarketplaceListings = () => {
  return marketplaceData.slice(0, 4);
};

export const getCoworkingBySlug = (slug: string) => {
  return coworkingsData.find((cw) => cw.slug === slug);
};
