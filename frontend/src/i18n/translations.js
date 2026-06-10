const translations = {
  en: {
    // Navbar
    'nav.searchPlaceholder': 'Search city...',
    'nav.telegram': 'Telegram',

    // Telegram Modal
    'modal.telegram.title': 'Get Earthquake Alerts',
    'modal.telegram.desc': 'Get instant earthquake notifications ≥ 5.0 magnitude delivered to your Telegram.',
    'modal.telegram.step1': 'Tap the button below to open our Telegram bot',
    'modal.telegram.step2': 'Send /start to subscribe to alerts',
    'modal.telegram.step3': 'Receive real-time notifications for earthquakes ≥ 5.0 SR',
    'modal.telegram.openButton': 'Open @TremorIDBot',
    'modal.telegram.close': 'Close',

    // Timeline
    'timeline.title': '7-Day Activity',
    'timeline.loading': 'Loading...',
    'timeline.error': 'Error',

    // FilterPanel
    'filter.title': 'Filters',
    'filter.magnitude': 'Magnitude',
    'filter.depth': 'Depth (km)',
    'filter.minMag': 'Min Mag',
    'filter.maxMag': 'Max Mag',
    'filter.maxDepth': 'Max Depth',
    'filter.apply': 'Apply',
    'filter.reset': 'Reset',

    // QuakeList
    'list.title': 'Recent Earthquakes',
    'list.loading': 'Loading earthquakes...',
    'list.error': 'Failed to fetch earthquakes',
    'list.noData': 'No earthquakes found',
    'list.filtersActive': '{count} active',

    // QuakeCard
    'card.km': 'km',
    'card.ago': 'ago',
    'card.felt': 'Felt',

    // DetailPanel
    'detail.magnitude': 'Magnitude',
    'detail.location': 'Location',
    'detail.coordinates': 'Coordinates',
    'detail.depth': 'Depth',
    'detail.dateTime': 'Date & Time',
    'detail.tsunamiRisk': 'TSUNAMI RISK',
    'detail.noThreat': 'No Tsunami Threat',
    'detail.aiSummary': 'AI Summary',
    'detail.loadingSummary': 'Loading summary...',
    'detail.noSummary': 'No summary available.',
    'detail.close': 'Close',
    'detail.unknown': 'Unknown',

    // AmISafe
    'safe.title': 'Am I Safe?',
    'safe.description': 'Check recent earthquake activity within 500km of a major Indonesian city.',
    'safe.cityLabel': 'City or location name',
    'safe.placeholder': 'Try Jakarta, Bandung, Denpasar...',
    'safe.check': 'Check Safety',
    'safe.checking': 'Checking...',
    'safe.errorCity': 'Please enter one of: {cities}.',
    'safe.errorFetch': 'Unable to fetch recent earthquake data.',
    'safe.errorGeneral': 'Unable to check safety right now.',
    'safe.coordinates': 'Coordinates',
    'safe.recentQuakes': 'Recent quakes within 500km',
    'safe.largestMagnitude': 'Largest magnitude',
    'safe.safetyTips': 'Safety tips',
  },
  id: {
    // Navbar
    'nav.searchPlaceholder': 'Cari kota...',
    'nav.telegram': 'Telegram',

    // Telegram Modal
    'modal.telegram.title': 'Dapatkan Peringatan Gempa',
    'modal.telegram.desc': 'Dapatkan notifikasi gempa instan ≥ 5.0 magnitudo langsung ke Telegram Anda.',
    'modal.telegram.step1': 'Ketuk tombol di bawah untuk membuka bot Telegram kami',
    'modal.telegram.step2': 'Kirim /start untuk berlangganan peringatan',
    'modal.telegram.step3': 'Terima notifikasi real-time untuk gempa ≥ 5.0 SR',
    'modal.telegram.openButton': 'Buka @TremorIDBot',
    'modal.telegram.close': 'Tutup',

    // Timeline
    'timeline.title': 'Aktivitas 7 Hari',
    'timeline.loading': 'Memuat...',
    'timeline.error': 'Gagal',

    // FilterPanel
    'filter.title': 'Filter',
    'filter.magnitude': 'Magnitudo',
    'filter.depth': 'Kedalaman (km)',
    'filter.minMag': 'Min Mag',
    'filter.maxMag': 'Maks Mag',
    'filter.maxDepth': 'Maks Kedalaman',
    'filter.apply': 'Terapkan',
    'filter.reset': 'Reset',

    // QuakeList
    'list.title': 'Gempa Terkini',
    'list.loading': 'Memuat gempa...',
    'list.error': 'Gagal memuat gempa',
    'list.noData': 'Tidak ada gempa ditemukan',
    'list.filtersActive': '{count} aktif',

    // QuakeCard
    'card.km': 'km',
    'card.ago': 'lalu',
    'card.felt': 'Dirasakan',

    // DetailPanel
    'detail.magnitude': 'Magnitudo',
    'detail.location': 'Lokasi',
    'detail.coordinates': 'Koordinat',
    'detail.depth': 'Kedalaman',
    'detail.dateTime': 'Tanggal & Waktu',
    'detail.tsunamiRisk': 'RISIKO TSUNAMI',
    'detail.noThreat': 'Tidak Ada Ancaman Tsunami',
    'detail.aiSummary': 'Ringkasan AI',
    'detail.loadingSummary': 'Memuat ringkasan...',
    'detail.noSummary': 'Ringkasan tidak tersedia.',
    'detail.close': 'Tutup',
    'detail.unknown': 'Tidak diketahui',

    // AmISafe
    'safe.title': 'Apakah Saya Aman?',
    'safe.description': 'Periksa aktivitas gempa terkini dalam radius 500km dari kota-kota besar di Indonesia.',
    'safe.cityLabel': 'Nama kota atau lokasi',
    'safe.placeholder': 'Coba Jakarta, Bandung, Denpasar...',
    'safe.check': 'Periksa Keamanan',
    'safe.checking': 'Memeriksa...',
    'safe.errorCity': 'Masukkan salah satu: {cities}.',
    'safe.errorFetch': 'Gagal memuat data gempa terkini.',
    'safe.errorGeneral': 'Tidak dapat memeriksa keamanan saat ini.',
    'safe.coordinates': 'Koordinat',
    'safe.recentQuakes': 'Gempa dalam radius 500km',
    'safe.largestMagnitude': 'Magnitudo terbesar',
    'safe.safetyTips': 'Tips keamanan',
  },
}

export default translations
