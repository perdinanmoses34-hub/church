import { HymnSong } from '../types';

export const INITIAL_HYMN_SONGS: HymnSong[] = [
  // ==================== KIDUNG JEMAAT (KJ) ====================
  {
    id: 'KJ-1',
    category: 'KJ',
    number: '1',
    title: 'Haleluya! Pujilah Allah Yang Agung',
    key: 'Do = D',
    time_signature: '4/4',
    author: 'Mazmur 150 / Tradisional',
    tags: ['Pembukaan', 'Pujian', 'Kemuliaan'],
    lyrics: [
      'Haleluya! Pujilah Allah Yang Agung, Mahaesa!\nDalam Kristus kita kenal Allah Yang Hidup, Bapa kekal!',
      'Langit, bumi, buktikanlah kemuliaan-Nya tak terhingga!\nBintang-bintang bertaburan memuji keagungan TUHAN!',
      'Pujilah Dia hai manusia, dengan rebana dan kecapi!\nBiarlah segala yang bernafas memuji TUHAN, Haleluya!'
    ],
    chorus: 'Kemuliaan bagi Allah di tempat yang mahatinggi!\nDan damai sejahtera di bumi di antara manusia yang berkenan kepada-Nya.'
  },
  {
    id: 'KJ-2',
    category: 'KJ',
    number: '2',
    title: 'Suci, Suci, Suci',
    key: 'Do = Es',
    time_signature: '4/4',
    author: 'Reginald Heber / John B. Dykes',
    tags: ['Kudus', 'Trinitas', 'Pujian Pagi'],
    lyrics: [
      'Suci, suci, suci! Tuhan Maha Kuasa!\nDikau kami puji di pagi yang teduh.\nSuci, suci, suci, murah dan perkasa,\nAllah Tritunggal, agung nama-Mu!',
      'Suci, suci, suci! Kaum kudus menyembah,\nmenyerahkan mahkota di depan takhta-Mu.\nKerubim, serafim sujud menghormati\nYang Mahamulia, kekal abadi.',
      'Suci, suci, suci! Walau tersembunyi,\nwalau yang berdosa tak tahan memandang-Mu;\nKau tetap Yang Kudus, tiada terimbangi,\nKau Mahakuasa, murni kasih-Mu.'
    ]
  },
  {
    id: 'KJ-64',
    category: 'KJ',
    number: '64',
    title: 'Bila Kulihat Bintang Gemerlapan',
    key: 'Do = Bes',
    time_signature: '4/4',
    author: 'Carl Boberg / Stuart K. Hine (How Great Thou Art)',
    tags: ['Keagungan Allah', 'Penciptaan', 'Penyembahan'],
    lyrics: [
      'Bila kulihat bintang gemerlapan dan bunyi guruh yang menakjubkan,\nya Tuhanku, tak putus aku heran melihat ciptaan-Mu yang besar.',
      'Ya Tuhanku, pabila kurenungkan pemberian-Mu dalam Penebus,\nku tertegun: bagiku sekalian Yesus disalib sampai mati pun.',
      'Pabila nanti Kristus memanggilku ke rumah-Nya yang mulia dan megah,\nsuka citaku meluap menyembah: "Maha besar Kau, Jurus' + "'" + 'lamatku!"'
    ],
    chorus: 'Maka jiwaku pun memuji-Mu: "Sungguh besar Kau, Allahku!"\nMaka jiwaku pun memuji-Mu: "Sungguh besar Kau, Allahku!"'
  },
  {
    id: 'KJ-332',
    category: 'KJ',
    number: '332',
    title: 'Kekuatan Serta Penghiburan',
    key: 'Do = Es',
    time_signature: '4/4',
    author: 'Lina Sandell / Oscar Ahnfelt (Day by Day)',
    tags: ['Penghiburan', 'Kekuatan', 'Keluarga'],
    lyrics: [
      'Kekuatan serta penghiburan diberikan Tuhan padaku.\nTiap hari aku dibimbing-Nya, tiap jam dihibur hatiku.\nDan sesuai dengan hikmat Tuhan, ku dib' + "'" + 'ri apa yang perlu.\nSuka dan derita bergantian memperkuat iman dan teguh.',
      'Tiap hari Tuhan merangkulku, di b' + "'" + 'ri-Nya kasih-Nya yang kudus.\nBeban hatiku diringankan-Nya, ' + "'" + 'ku dip' + "'" + 'lihara-Nya terus.\nBagaikan seorang bapa sayang akan anak-anak tercinta,\nbagiku pun Tuhan demikian, ditenangkan-Nya segala gundah.'
    ]
  },
  {
    id: 'KJ-363',
    category: 'KJ',
    number: '363',
    title: 'Bagi Yesus Kuserahkan',
    key: 'Do = F',
    time_signature: '4/4',
    author: 'Judson W. Van DeVenter / Winfield S. Weeden',
    tags: ['Penyerahan Diri', 'Komitmen', 'Pelayanan'],
    lyrics: [
      'Bagi Yesus kuserahkan hidupku seluruhnya;\nhati dan perbuatanku, pun waktuku kepunyaan-Nya.\nBagi Yesus semuanya, pun waktuku kepunyaan-Nya.',
      'Tanganku kerja bagi-Nya, kakiku mengikut-Nya;\nmataku memandang Yesus, yang kupuji Dialah!\nBagi Yesus semuanya, yang kupuji Dialah!'
    ],
    chorus: 'Bagi Yesus semuanya, yang kupuji Dialah!\nBagi Yesus semuanya, yang kupuji Dialah!'
  },
  {
    id: 'KJ-376',
    category: 'KJ',
    number: '376',
    title: 'Ikut Dikau Saja Tuhan',
    key: 'Do = G',
    time_signature: '3/4',
    author: 'A. B. Simpson',
    tags: ['Pengiringan', 'Kesetiaan', 'Jalan Salib'],
    lyrics: [
      'Ikut Dikau saja, Tuhan, jalan damai bagiku;\nAku s' + "'" + 'rahkan jiwa raga pada naungan salib-Mu.\nIkut Dikau di terang-Mu, ikut Dikau di gelap,\n' + "'" + 'kan kurasa pertolongan dari tangan-Mu tetap.',
      'Ikut dan memikul salib, itu titah yang kudus;\nBiar ku rendah dan hina, ku mengikut Penebus.\nBiar dunia mencela ku, ku memandang wajah-Mu,\nSukacita dan mahkota kelak jadi milikku.'
    ],
    chorus: 'Ikut, ikut, ikut Tuhan, langkah-Nya tetap teguh!\nIkut, ikut, ikut Tuhan, sampai ke rumah baka.'
  },
  {
    id: 'KJ-400',
    category: 'KJ',
    number: '400',
    title: 'Kudaki Jalan Mulia',
    key: 'Do = G',
    time_signature: '3/4',
    author: 'Johnson Oatman Jr. / Charles H. Gabriel (Higher Ground)',
    tags: ['Pertumbuhan Rohani', 'Doa', 'Kemenangan'],
    lyrics: [
      'Kudaki jalan mulia; tetap doaku serta:\n"Tuhan, tempatkan langkahku di tempat tinggi dan teguh."',
      'Hati tak rindu berdiam di tempat ragu dan bimbang,\nbiar yang lain tinggal di situ, tempat tinggi tujuan hatiku.',
      'Kuingin hidup yang menang di atas bukit cemerlang,\nmemandang kota yang kudus, tempat baka berkat Penebus.'
    ],
    chorus: 'Ya Tuhan, angkat jiwaku lebih dekat kepada-Mu;\nLebih tinggi ku merindukan tempat teguh di sisi-Mu.'
  },
  {
    id: 'KJ-407',
    category: 'KJ',
    number: '407',
    title: 'Tuhan, Kau Sobat Orang Benar',
    key: 'Do = Es',
    time_signature: '4/4',
    author: 'Tradisional Gerejawi',
    tags: ['Doa', 'Pagi', 'Perlindungan'],
    lyrics: [
      'Tuhan, Kau Sobat orang benar, dengarkanlah seruanku;\nsinar kasih-Mu yang berseri penuhilah relung kalbuku.\nDi jalan yang berliku-liku peganglah tanganku erat,\nsupaya kakiku tak goyah di hadapan cobaan berat.'
    ]
  },
  {
    id: 'KJ-450',
    category: 'KJ',
    number: '450',
    title: 'Hidup Kita Yang Benar',
    key: 'Do = F',
    time_signature: '4/4',
    author: 'Ny. P. F. Becker',
    tags: ['Syukur', 'Persembahan', 'Keluarga'],
    lyrics: [
      'Hidup kita yang benar haruslah mengucap syukur.\nDalam Kristus bergemar, janganlah mengeluh.\nApa arti hidupmu biar mewah dan senang,\njika harta yang fana jadi sandaranmu?',
      'Biar badai bertiup dan ombak menderu,\ndalam lindungan Tuhan aman jiwa ragamu.\nTabahkanlah hatimu, berpeganglah pada-Nya,\nmaka sejahtera-Nya melingkupi selamanya.'
    ],
    chorus: 'Ucap syukur pada Allah, atas kemurahan-Nya!\nUcap syukur pada Allah, kar' + "'" + 'na kasih setia-Nya!'
  },

  // ==================== NYANYIKANLAH KIDUNG BARU (NKB) ====================
  {
    id: 'NKB-3',
    category: 'NKB',
    number: '3',
    title: 'Terpujilah Allah',
    key: 'Do = Bes',
    time_signature: '3/4',
    author: 'Fanny J. Crosby / William H. Doane (To God Be the Glory)',
    tags: ['Pujian', 'Penebusan', 'Sukacita'],
    lyrics: [
      'Terpujilah Allah, hikmat-Nya besar; begitu kasih-Nya ' + "'" + 'tuk dunia cemar,\nsehingga dib' + "'" + 'rilah Putra-Nya kudus mengangkat manusia serta menebus.',
      'Penebusan sempurna dibayar lunas, darah-Nya yang kudus menyucikan noda,\npencuri dan orang berdosa sekali pun yang percaya beroleh ampunan baka.',
      'Besar karya-Nya, mulia sabda-Nya, di dalam Putra-Nya gembira kita;\nnamun sukacita kita ' + "'" + 'kan melimpah saat kita berjumpa dengan Yesus di surga!'
    ],
    chorus: 'Pujilah! Pujilah! Buatlah dunia mendengar!\nPujilah! Pujilah! Buatlah umat-Nya gemar!\nMari datang pada Bapa lewat Yesus Putra-Nya,\ndan puji hikmat-Nya yang sungguh mulia!'
  },
  {
    id: 'NKB-7',
    category: 'NKB',
    number: '7',
    title: 'Nyanyikanlah Nyanyian Baru',
    key: 'Do = D',
    time_signature: '4/4',
    author: 'Arnoldus Isaak Apituley (Mazmur 98)',
    tags: ['Pujian', 'Musik Gerejawi', 'Pembukaan'],
    lyrics: [
      'Nyanyikanlah nyanyian baru bagi Allah, Pencipta cakrawala.\nPenguasa semesta alam, nama-Nya agung dan mulia.\nSorakkanlah haleluya, bunyikan nafiri dan sangkakala!\nAgungkanlah nama-Nya di hadapan takhta yang kudus.'
    ],
    chorus: 'Haleluya! Pujilah Dia dengan kecapi dan rebana!\nHaleluya! Pujilah Dia, Raja di atas segala raja!'
  },
  {
    id: 'NKB-14',
    category: 'NKB',
    number: '14',
    title: 'Jadilah, Tuhan, Kehendak-Mu',
    key: 'Do = Es',
    time_signature: '9/8',
    author: 'Adelaide A. Pollard / George C. Stebbins (Have Thine Own Way)',
    tags: ['Penyerahan', 'Doa', 'Ketaatan'],
    lyrics: [
      'Jadilah, Tuhan, kehendak-Mu! Kaulah Penjunan, ' + "'" + 'ku tanah liat.\nBentuklah aku sesuka-Mu, ' + "'" + 'kan ku nantikan dengan taat.',
      'Jadilah, Tuhan, kehendak-Mu! Ujilah daku, selidiki hati.\nSucikan aku seputih salju, di hadapan-Mu ku berserah diri.',
      'Jadilah, Tuhan, kehendak-Mu! S' + "'" + 'luruh diriku ku persembahkan.\nPenuhilah hatiku dengan Roh-Mu, agar hidupku memuliakan-Mu.'
    ]
  },
  {
    id: 'NKB-34',
    category: 'NKB',
    number: '34',
    title: 'Setia-Mu, Tuhanku, Menghiburkan',
    key: 'Do = D',
    time_signature: '3/4',
    author: 'Thomas O. Chisholm / William M. Runyan (Great Is Thy Faithfulness)',
    tags: ['Kesetiaan Allah', 'Pagi Hari', 'Pengharapan'],
    lyrics: [
      'Setia-Mu, Tuhanku, menghiburkan; tiada bertaut bayang gundah.\nEngkau tak berubah, kekal selamanya; kasih-Mu yang limpah tiada pernah musnah.',
      'Musim kemarau, penghujan dan dingin, matahari, rembulan serta bintang benderang,\nbukti nyata kesetiaan-Mu yang agung, berkat rahmat-Mu senantiasa memancar.',
      'Ampunan dosaku dan damai abadi, kehadiran-Mu menghibur hatiku,\nkekuatan hari ini dan harapan esok, berkat melimpah bagiku setiap waktu.'
    ],
    chorus: 'Besar setia-Mu! Besar setia-Mu! Tiap pagi rahmat baru kutemukan;\nApa yang kubutuhkan Kau sediakan, besar setia-Mu kepadaku!'
  },
  {
    id: 'NKB-116',
    category: 'NKB',
    number: '116',
    title: 'Siapa Yang Berpegang',
    key: 'Do = F',
    time_signature: '4/4',
    author: 'John H. Sammis / Daniel B. Towner (Trust and Obey)',
    tags: ['Percaya & Taat', 'Iman', 'Keluarga'],
    lyrics: [
      'Siapa yang berpegang pada sabda Tuhan dan setia menurutinya,\nhidupnya mulia dalam cahaya terang bersekutu dengan Tuhannya.',
      'Biar bayang kelam atau badai menerpa, senyuman-Nya menghalau kabut lara;\ntak ada dukacita atau air mata yang dapat bertahan di hadapan-Nya.'
    ],
    chorus: 'Percayalah dan pegang sabda-Nya! Tiada jalan lain bahagia dalam Yesus,\nselain percaya dan patuh!'
  },
  {
    id: 'NKB-133',
    category: 'NKB',
    number: '133',
    title: 'Syukur Pada-Mu, Ya Allah',
    key: 'Do = Es',
    time_signature: '3/4',
    author: 'August Ludvig Storm / J. A. Hultman (Thanks to God)',
    tags: ['Syukur', 'Doa', 'Pengharapan'],
    lyrics: [
      'Syukur pada-Mu, ya Allah, atas segala kurnia-Mu!\nSyukur atas fajar merekah, dan senja yang penuh damai!\nSyukur atas tawa dan air mata, syukur atas penghiburan-Mu;\nSyukur atas doa yang terjawab, dan yang Kau tunda dengan hikmat.',
      'Syukur atas mawar di jalan, syukur juga duri di batangnya;\nSyukur atas rumah yang teduh, dan perlindungan tangan-Mu;\nSyukur atas sukacita yang meluap, syukur atas damai baka;\nSyukur atas kasih karunia-Mu di sepanjang jalan hidupku!'
    ]
  },
  {
    id: 'NKB-197',
    category: 'NKB',
    number: '197',
    title: 'Besarlah Kasih Bapaku',
    key: 'Do = G',
    time_signature: '4/4',
    author: 'Tradisional / Kidung Rohani',
    tags: ['Kasih Bapa', 'Penebusan', 'Anak Allah'],
    lyrics: [
      'Besarlah kasih Bapaku, selalu melingkupiku;\ndi mana pun ' + "'" + 'ku berada, kasih-Nya nyata kurasa.\nTak pernah ditinggalkan-Nya anak-Nya yang bersandar teguh,\n' + "'" + 'kan dibimbing-Nya tanganku sampai ke rumah yang baka.'
    ],
    chorus: 'Kasih Bapa abadi, tak terukur dalamnya!\nLebih tinggi dari langit, lebih luas dari samudera!'
  },

  // ==================== PELENGKAP KIDUNG JEMAAT (PKJ) ====================
  {
    id: 'PKJ-2',
    category: 'PKJ',
    number: '2',
    title: 'Mulia, Mulia Nama-Nya',
    key: 'Do = G',
    time_signature: '4/4',
    author: 'Tradisional Gerejawi',
    tags: ['Pujian', 'Keagungan', 'Pembukaan'],
    lyrics: [
      'Mulia, mulia nama-Nya, bagi Yesus kemuliaan, puji, hormat dan sembah!\nMulia, kekuasaan-Nya memb' + "'" + 'ri berkat bagi jemaat, bersoraklah!',
      'Pujilah, tinggikanlah Rajamu Yesus, Dialah selamanya Sang Penebus.\nMulia, mulia nama-Nya, bagi Yesus yang bertahta di tempat kudus!'
    ]
  },
  {
    id: 'PKJ-14',
    category: 'PKJ',
    number: '14',
    title: 'Kunyanyikan Kasih Setia Tuhan',
    key: 'Do = D',
    time_signature: '4/4',
    author: 'Tradisional / Mazmur 89',
    tags: ['Kasih Setia', 'Sukacita', 'Kesaksian'],
    lyrics: [
      'Kunyanyikan kasih setia Tuhan selamanya, ku nyanyikan!\nKunyanyikan kasih setia Tuhan selamanya, ku nyanyikan kasih setia-Nya!',
      'Kututurkan tak jemu-jemu kasih setia-Mu turun-temurun;\nKututurkan tak jemu-jemu kasih setia-Mu, ya Tuhan, pada s' + "'" + 'luruh bangsa!'
    ]
  },
  {
    id: 'PKJ-179',
    category: 'PKJ',
    number: '179',
    title: 'Kasih Paling Agung',
    key: 'Do = F',
    time_signature: '4/4',
    author: 'Pontas Purba',
    tags: ['Kasih Kristus', 'Salib', 'Perjamuan Kudus'],
    lyrics: [
      'Kasih paling agung dari Baginda Yesus, dibuktikannya di bukit Golgota.\nDia rela mati menebus dosaku, agar aku beroleh hidup kekal selamanya.',
      'Tiada kasih yang lebih besar daripada kasih-Mu, menyerahkan nyawa demi sahabat-Nya;\nOh Yesus Tuhanku, ku sembah Dikau selalu, ku persembahkan seluruh hidupku untuk-Mu.'
    ]
  },
  {
    id: 'PKJ-242',
    category: 'PKJ',
    number: '242',
    title: 'Seindah Siang Disinari Terang',
    key: 'Do = Es',
    time_signature: '3/4',
    author: 'Tradisional Rohani Nusantara',
    tags: ['Damai', 'Sukacita', 'Hari Bahagia'],
    lyrics: [
      'Seindah siang disinari terang, seindah malam bertabur bintang,\nseindah itu kasih Tuhan pada umat-Nya, tiada bertepi selamanya.',
      'Selembut embun membasahi padang, selembut bisikan Roh Penolong,\nselembut itu belaian tangan Sang Gembala membimbing domba-domba-Nya.'
    ],
    chorus: 'Kasih setia-Mu, ya Tuhan, melimpah di hidupku!\nSukacita dan damai sejahtera memancar di jiwaku.'
  },
  {
    id: 'PKJ-255',
    category: 'PKJ',
    number: '255',
    title: 'Bapa Kami Yang Ada Di Surga',
    key: 'Do = F',
    time_signature: '4/4',
    author: 'Tradisional / Doa Bapa Kami',
    tags: ['Doa', 'Kudus', 'Penutup'],
    lyrics: [
      'Bapa kami yang ada di surga, dikuduskanlah nama-Mu;\ndatanglah Kerajaan-Mu, jadilah kehendak-Mu di bumi seperti di surga.',
      'Berikanlah kami pada hari ini makanan kami yang secukupnya;\ndan ampunilah kami akan kesalahan kami, seperti kami mengampuni orang yang bersalah kepada kami;',
      'dan janganlah bawa kami ke dalam pencobaan, tetapi lepaskanlah kami dari yang jahat;\nkar' + "'" + 'na Engkaulah yang empunya Kerajaan, dan kuasa dan kemuliaan sampai s' + "'" + 'lama-lamanya. Amin.'
    ]
  },
  {
    id: 'PKJ-282',
    category: 'PKJ',
    number: '282',
    title: 'Tuhan, Tolonglah dan Jagalah',
    key: 'Do = G',
    time_signature: '4/4',
    author: 'Kidung Gerejawi',
    tags: ['Doa Syafaat', 'Keluarga', 'Perlindungan'],
    lyrics: [
      'Tuhan, tolonglah dan jagalah hidup kami setiap saat;\nBimbing kaki kami agar melangkah di jalan kebenaran-Mu yang tepat.\nJauhkan dari mara bahaya, peliharalah damai sejahtera,\nagar rumah tangga kami bersinar memancarkan terang kasih-Mu di dunia.'
    ]
  },

  // ==================== LAGU ROHANI KONTEMPORER (PRAISE & WORSHIP) ====================
  {
    id: 'CONTEMP-1',
    category: 'KONTEMPORER',
    title: 'Sentuh Hatiku',
    key: 'G',
    author: 'Jason Irwanto Chang',
    tags: ['Penyembahan', 'Sentuhan Tuhan', 'Hati Hancur'],
    lyrics: [
      'Betapa kumencintai segala yang t\'lah Kauperbuat\nTak terhingga kasih-Mu dalam hidupku\nKu tahu Kau selalu ada saat kubutuhkan pertolongan-Mu\nKau mengangkatku saat kujatuh',
      'Kini kubersujud di hadapan takhta-Mu\nMenyerahkan seluruh masa depanku\nBentuklah bejana hatiku seturut rancangan-Mu\nAgar hidupku berkenan bagi-Mu'
    ],
    chorus: 'Sentuh hatiku, ubah hidupku\nMenjadi yang Kauinginkan\nBiar Roh Kudus-Mu memulihkanku\nKusujud menyembah-Mu',
    chords: `[Verse 1]
G                 D/F#
Betapa kumencintai
Em                Bm
Segala yang t'lah Kauperbuat
C                  G/B
Tak terhingga kasih-Mu
Am             D
Dalam hidupku

[Chorus]
G             D/F#      Em
Sentuh hatiku, ubah hidupku
Bm          C
Menjadi yang Kauinginkan
G/B             Am       D
Biar Roh Kudus-Mu memulihkanku
        G
Kusujud menyembah-Mu`
  },
  {
    id: 'CONTEMP-2',
    category: 'KONTEMPORER',
    title: 'Seperti Rusa Rindu Sungai-Mu',
    key: 'D',
    author: 'Martin J. Nystrom (As the Deer)',
    tags: ['Kehausan Jiwa', 'Penyembahan', 'Kekuatan'],
    lyrics: [
      'Seperti rusa rindu sungai-Mu, jiwaku rindu Engkau\nKaulah Tuhan hasrat hatiku, kurindu menyembah-Mu',
      'Engkau perisaiku dan kekuatanku, kepada-Mu rohku berserah\nKaulah Tuhan hasrat hatiku, kurindu menyembah-Mu'
    ],
    chorus: 'Kaulah kekuatan dan perisaiku, kepada-Mu rohku berserah\nKaulah Tuhan hasrat hatiku, kurindu menyembah-Mu',
    chords: `[Verse]
D             A/C#        Bm       D/A
Seperti rusa rindu sungai-Mu
G         A        D     A
Jiwaku rindu Engkau
D             A/C#       Bm       D/A
Kaulah Tuhan hasrat hatiku
G          A        D
Kurindu menyembah-Mu

[Chorus]
Bm            G             D/F#
Kaulah kekuatan dan perisaiku
G             Em       F#
Kepada-Mu rohku berserah
D             A/C#       Bm       D/A
Kaulah Tuhan hasrat hatiku
G          A        D
Kurindu menyembah-Mu`
  },
  {
    id: 'CONTEMP-3',
    category: 'KONTEMPORER',
    title: 'Janji-Mu S\'perti Fajar',
    key: 'F',
    author: 'Afendy & Herry Priyonggo',
    tags: ['Janji Tuhan', 'Pengharapan', 'Pagi Hari'],
    lyrics: [
      'Ketika kuhadapi kehidupan ini\nJalan mana yang harus kupilih\nKutahu, kutak mampu\nKutahu, kutak sanggup\nHanya Kau, Tuhan, tempat jawabanku',
      'Aku pun tahu ku tak pernah sendiri\nSebab Engkau selalu mendampingi\nSaat badai datang menerpa\nKau genggam erat tanganku'
    ],
    chorus: 'Janji-Mu s\'perti fajar pagi hari\nDan tiada pernah terlambat bersinar\nCinta-Mu s\'perti sungai yang mengalir\nDan ku tahu betapa dalam kasih-Mu',
    chords: `[Verse]
F                 C/E
Ketika kuhadapi kehidupan ini
Dm                Am
Jalan mana yang harus kupilih
Bb               F/A
Kutahu, kutak mampu
Gm               C
Kutahu, kutak sanggup
Bb          C            F
Hanya Kau, Tuhan, tempat jawabanku

[Chorus]
F                  C/E
Janji-Mu s'perti fajar pagi hari
Dm                 Am
Dan tiada pernah terlambat bersinar
Bb                 F/A
Cinta-Mu s'perti sungai yang mengalir
Gm             C          F
Dan ku tahu betapa dalam kasih-Mu`
  },
  {
    id: 'CONTEMP-4',
    category: 'KONTEMPORER',
    title: 'Kebaikan-Mu Penuh (Goodness of God)',
    key: 'G',
    author: 'Bethel Music / Jenn Johnson',
    tags: ['Kebaikan Allah', 'Kesetiaan', 'Syukur'],
    lyrics: [
      'Kucinta Kau, kasih-Mu tak berkesudahan\nSetiap hari, ku dalam tangan-Mu\nDari sejak kubangun, hingga kubaringkan tubuhku\nKu \'kan menyanyikan kebaikan-Mu',
      'Kusuka suara-Mu, menuntunku lewat api\nDalam gelap gulita, Kau dekat selalu\nKau kukenal s\'bagai Bapa, Kau s\'bagai Sahabat setia\nKuhidup dalam kebaikan-Mu'
    ],
    chorus: 'Sepanjang hidupku Kau setia\nSepanjang hidupku Kau sungguh baik\nDengan tiap hembusan nafasku\nKu \'kan bernyanyi tentang kebaikan-Mu',
    chords: `[Verse 1]
G                      C           G
Kucinta Kau, kasih-Mu tak berkesudahan
       D/F#   Em          C          D
Setiap hari,      ku dalam tangan-Mu
                Em           C
Dari sejak kubangun, hingga kubaringkan tubuhku
G        D/F#  Em    C       D      G
Ku 'kan menyanyikan kebaikan-Mu

[Chorus]
C                            G
Sepanjang hidupku Kau setia
C                            G        D
Sepanjang hidupku Kau sungguh baik
C                              G   D/F# Em
Dengan tiap hembusan nafasku
C             D             G
Ku 'kan bernyanyi tentang kebaikan-Mu`
  },
  {
    id: 'CONTEMP-5',
    category: 'KONTEMPORER',
    title: 'Allah Sumber Kuatku',
    key: 'C',
    author: 'Jonathan Prawira',
    tags: ['Kekuatan', 'Perlindungan', 'Penyembahan'],
    lyrics: [
      'Hanya dekat Allah saja aku tenang\nDari pada-Nyalah keselamatanku\nHanya Dia gunung batuku dan kota bentengku\nAku tidak akan goyah selama-lamanya'
    ],
    chorus: 'Allah sumber kuatku\nAllah sumber kuatku\nDan bagianku selama-lamanya\nSelama-lamanya!',
    chords: `[Verse]
C           G/B        Am
Hanya dekat Allah saja aku tenang
F            C/E       Dm      G
Dari pada-Nyalah keselamatanku
C            G/B        Am
Hanya Dia gunung batuku dan kota bentengku
F             G             C
Aku tidak akan goyah selama-lamanya

[Chorus]
F      G      Em     Am
Allah sumber kuatku
Dm     G      C
Allah sumber kuatku
F      G      Em     Am
Dan bagianku selama-lamanya
Dm     G      C
Selama-lamanya!`
  },
  {
    id: 'CONTEMP-6',
    category: 'KONTEMPORER',
    title: 'Bapa Engkau Sungguh Baik',
    key: 'F',
    author: 'Pdt. Ir. Niko Njotorahardjo',
    tags: ['Bapa Yang Baik', 'Kasih', 'Syukur Pagi'],
    lyrics: [
      'Bapa, Engkau sungguh baik\nKasih-Mu melimpah di hidupku\nBapa, kubert\'rima kasih\nBerkat-Mu hari ini yang Kausediakan bagiku'
    ],
    chorus: 'Kunaikkan syukurku buat hari yang Kau b\'ri\nTak habis-habisnya kasih dan rahmat-Mu\nS\'lalu baru dan tak pernah terlambat pertolongan-Mu\nBesar setia-Mu di s\'panjang hidupku',
    chords: `[Verse]
F             C/E
Bapa, Engkau sungguh baik
Dm            Am
Kasih-Mu melimpah di hidupku
Bb            F/A
Bapa, kubert'rima kasih
Gm                  C
Berkat-Mu hari ini yang Kausediakan bagiku

[Chorus]
F                  C/E      Dm
Kunaikkan syukurku buat hari yang Kau b'ri
Am                  Bb
Tak habis-habisnya kasih dan rahmat-Mu
F/A                   Gm            C
S'lalu baru dan tak pernah terlambat pertolongan-Mu
Bb        C         F
Besar setia-Mu di s'panjang hidupku`
  },
  {
    id: 'CONTEMP-7',
    category: 'KONTEMPORER',
    title: 'S\'bab Kau Besar',
    key: 'C',
    author: 'Tradisional / Hillsong (For Thou Art Great)',
    tags: ['Kemuliaan', 'Pujian', 'Kekuasaan'],
    lyrics: [
      'Kuberi kemuliaan dan hormat\nKuangkat suara pujian, kuagungkan nama-Mu\nKuberi kemuliaan dan hormat\nKuangkat suara pujian, kuagungkan nama-Mu'
    ],
    chorus: 'S\'bab Kau besar, perbuatan-Mu ajaib\nTiada seperti Engkau, tiada seperti Engkau\nS\'bab Kau besar, perbuatan-Mu ajaib\nTiada seperti Engkau, tiada seperti Engkau!',
    chords: `[Verse]
C                Em
Kuberi kemuliaan dan hormat
F                 Dm             G
Kuangkat suara pujian, kuagungkan nama-Mu
C                Em
Kuberi kemuliaan dan hormat
F                 Dm             G
Kuangkat suara pujian, kuagungkan nama-Mu

[Chorus]
C              Em
S'bab Kau besar, perbuatan-Mu ajaib
F                 Dm           G
Tiada seperti Engkau, tiada seperti Engkau
C              Em
S'bab Kau besar, perbuatan-Mu ajaib
F                 G            C
Tiada seperti Engkau, tiada seperti Engkau!`
  },
  {
    id: 'CONTEMP-8',
    category: 'KONTEMPORER',
    title: 'Kaulah Harapan',
    key: 'G',
    author: 'Sari Simorangkir',
    tags: ['Harapan', 'Pertolongan', 'Penyembahan'],
    lyrics: [
      'Bukan dengan kekuatanku\nKudapat jalani hidupku\nTanpa Tuhan yang disampingku\nKutak mampu sendiri',
      'Engkaulah kuatku\nYang menopang hidupku\nDi saat kuterjatuh\nTangan-Mu mengangkatku'
    ],
    chorus: 'Kuberharap pada-Mu, Kaulah perlindunganku\nKuberharap pada-Mu, Kaulah kekuatanku\nKaulah harapan di saat kurapuh\nYesus, pada-Mu kuberserah',
    chords: `[Verse]
G                  D/F#
Bukan dengan kekuatanku
Em                 Bm
Kudapat jalani hidupku
C                  G/B
Tanpa Tuhan yang disampingku
Am             D
Kutak mampu sendiri

[Chorus]
G             D/F#
Kuberharap pada-Mu
Em            Bm
Kaulah perlindunganku
C             G/B
Kuberharap pada-Mu
Am            D
Kaulah kekuatanku
C             D             G
Yesus, pada-Mu kuberserah`
  },
  {
    id: 'CONTEMP-9',
    category: 'KONTEMPORER',
    title: 'Jangan Lelah',
    key: 'C',
    author: 'Jonathan Prawira',
    tags: ['Pelayanan', 'Semangat', 'Ladang Tuhan'],
    lyrics: [
      'Jangan lelah bekerja di ladang-Nya Tuhan\nRoh Kudus yang b\'ri kekuatan\nYang mengajar dan menopang\nTiada lelah bekerja bersama-Mu, Tuhan\nYang selalu mencukupkan atas segalanya'
    ],
    chorus: 'Ratakan tanah bergelombang, timbunlah tanah yang berlubang\nMenjadi siap dibangun di atas dasar iman\nRatakan tanah bergelombang, timbunlah tanah yang berlubang\nMenjadi siap dibangun di atas dasar iman!',
    chords: `[Verse]
C                Em
Jangan lelah bekerja di ladang-Nya Tuhan
F            Dm          G
Roh Kudus yang b'ri kekuatan
Em           Am
Yang mengajar dan menopang
Dm                G
Tiada lelah bekerja bersama-Mu, Tuhan
Em                Am
Yang selalu mencukupkan
Dm           G           C
Atas segalanya`
  },
  {
    id: 'CONTEMP-10',
    category: 'KONTEMPORER',
    title: 'Waktu Tuhan',
    key: 'G',
    author: 'NDC Worship',
    tags: ['Waktu Terbaik', 'Penantian', 'Rancangan Indah'],
    lyrics: [
      'Bila Kau ijinkan sesuatu terjadi\nKutahu semua untuk kebaikanku\nBila nanti telah tiba waktu-Mu\nKupastikan karya-Mu indah di hidupku'
    ],
    chorus: 'Waktu Tuhan pasti yang terbaik\nWalau kadang tak mudah dimengerti\nLewat badai cobaan, semua mendatangkan kebaikan\nWaktu Tuhan pasti yang terbaik',
    chords: `[Verse]
G                 D/F#
Bila Kau ijinkan sesuatu terjadi
Em                Bm
Kutahu semua untuk kebaikanku
C                 G/B
Bila nanti telah tiba waktu-Mu
Am                D
Kupastikan karya-Mu indah di hidupku

[Chorus]
G                 D/F#
Waktu Tuhan pasti yang terbaik
Em                Bm
Walau kadang tak mudah dimengerti
C                 G/B
Lewat badai cobaan, semua mendatangkan kebaikan
Am         D        G
Waktu Tuhan pasti yang terbaik`
  }
];
