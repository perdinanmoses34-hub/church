import { BibleBook, BibleVerse } from '../types';

export const BIBLE_BOOKS: BibleBook[] = [
  // PERJANJIAN LAMA (39 Kitab)
  { id: 'GEN', name: 'Kejadian', abbreviation: 'Kej', testament: 'PL', category: 'Taurat', chapters_count: 50 },
  { id: 'EXO', name: 'Keluaran', abbreviation: 'Kel', testament: 'PL', category: 'Taurat', chapters_count: 40 },
  { id: 'LEV', name: 'Imamat', abbreviation: 'Im', testament: 'PL', category: 'Taurat', chapters_count: 27 },
  { id: 'NUM', name: 'Bilangan', abbreviation: 'Bil', testament: 'PL', category: 'Taurat', chapters_count: 36 },
  { id: 'DEU', name: 'Ulangan', abbreviation: 'Ul', testament: 'PL', category: 'Taurat', chapters_count: 34 },
  { id: 'JOS', name: 'Yosua', abbreviation: 'Yos', testament: 'PL', category: 'Sejarah', chapters_count: 24 },
  { id: 'JDG', name: 'Hakim-hakim', abbreviation: 'Hak', testament: 'PL', category: 'Sejarah', chapters_count: 21 },
  { id: 'RUT', name: 'Rut', abbreviation: 'Rut', testament: 'PL', category: 'Sejarah', chapters_count: 4 },
  { id: '1SA', name: '1 Samuel', abbreviation: '1Sam', testament: 'PL', category: 'Sejarah', chapters_count: 31 },
  { id: '2SA', name: '2 Samuel', abbreviation: '2Sam', testament: 'PL', category: 'Sejarah', chapters_count: 24 },
  { id: '1KI', name: '1 Raja-raja', abbreviation: '1Raj', testament: 'PL', category: 'Sejarah', chapters_count: 22 },
  { id: '2KI', name: '2 Raja-raja', abbreviation: '2Raj', testament: 'PL', category: 'Sejarah', chapters_count: 25 },
  { id: '1CH', name: '1 Tawarikh', abbreviation: '1Taw', testament: 'PL', category: 'Sejarah', chapters_count: 29 },
  { id: '2CH', name: '2 Tawarikh', abbreviation: '2Taw', testament: 'PL', category: 'Sejarah', chapters_count: 36 },
  { id: 'EZR', name: 'Ezra', abbreviation: 'Ezr', testament: 'PL', category: 'Sejarah', chapters_count: 10 },
  { id: 'NEH', name: 'Nehemia', abbreviation: 'Neh', testament: 'PL', category: 'Sejarah', chapters_count: 13 },
  { id: 'EST', name: 'Ester', abbreviation: 'Est', testament: 'PL', category: 'Sejarah', chapters_count: 10 },
  { id: 'JOB', name: 'Ayub', abbreviation: 'Ayb', testament: 'PL', category: 'Puisi & Hikmat', chapters_count: 42 },
  { id: 'PSA', name: 'Mazmur', abbreviation: 'Mzm', testament: 'PL', category: 'Puisi & Hikmat', chapters_count: 150 },
  { id: 'PRO', name: 'Amsal', abbreviation: 'Ams', testament: 'PL', category: 'Puisi & Hikmat', chapters_count: 31 },
  { id: 'ECC', name: 'Pengkhotbah', abbreviation: 'Pkh', testament: 'PL', category: 'Puisi & Hikmat', chapters_count: 12 },
  { id: 'SNG', name: 'Kidung Agung', abbreviation: 'Kid', testament: 'PL', category: 'Puisi & Hikmat', chapters_count: 8 },
  { id: 'ISA', name: 'Yesaya', abbreviation: 'Yes', testament: 'PL', category: 'Nabi-nabi Besar', chapters_count: 66 },
  { id: 'JER', name: 'Yeremia', abbreviation: 'Yer', testament: 'PL', category: 'Nabi-nabi Besar', chapters_count: 52 },
  { id: 'LAM', name: 'Ratapan', abbreviation: 'Rat', testament: 'PL', category: 'Nabi-nabi Besar', chapters_count: 5 },
  { id: 'EZK', name: 'Yehezkiel', abbreviation: 'Yeh', testament: 'PL', category: 'Nabi-nabi Besar', chapters_count: 48 },
  { id: 'DAN', name: 'Daniel', abbreviation: 'Dan', testament: 'PL', category: 'Nabi-nabi Besar', chapters_count: 12 },
  { id: 'HOS', name: 'Hosea', abbreviation: 'Hos', testament: 'PL', category: 'Nabi-nabi Kecil', chapters_count: 14 },
  { id: 'JOL', name: 'Yoel', abbreviation: 'Yol', testament: 'PL', category: 'Nabi-nabi Kecil', chapters_count: 3 },
  { id: 'AMO', name: 'Amos', abbreviation: 'Am', testament: 'PL', category: 'Nabi-nabi Kecil', chapters_count: 9 },
  { id: 'OBA', name: 'Obaja', abbreviation: 'Ob', testament: 'PL', category: 'Nabi-nabi Kecil', chapters_count: 1 },
  { id: 'JON', name: 'Yunus', abbreviation: 'Yun', testament: 'PL', category: 'Nabi-nabi Kecil', chapters_count: 4 },
  { id: 'MIC', name: 'Mikha', abbreviation: 'Mik', testament: 'PL', category: 'Nabi-nabi Kecil', chapters_count: 7 },
  { id: 'NAM', name: 'Nahum', abbreviation: 'Nah', testament: 'PL', category: 'Nabi-nabi Kecil', chapters_count: 3 },
  { id: 'HAB', name: 'Habakuk', abbreviation: 'Hab', testament: 'PL', category: 'Nabi-nabi Kecil', chapters_count: 3 },
  { id: 'ZEP', name: 'Zefanya', abbreviation: 'Zef', testament: 'PL', category: 'Nabi-nabi Kecil', chapters_count: 3 },
  { id: 'HAG', name: 'Hagai', abbreviation: 'Hag', testament: 'PL', category: 'Nabi-nabi Kecil', chapters_count: 2 },
  { id: 'ZEC', name: 'Zakharia', abbreviation: 'Zak', testament: 'PL', category: 'Nabi-nabi Kecil', chapters_count: 14 },
  { id: 'MAL', name: 'Maleakhi', abbreviation: 'Mal', testament: 'PL', category: 'Nabi-nabi Kecil', chapters_count: 4 },

  // PERJANJIAN BARU (27 Kitab)
  { id: 'MAT', name: 'Matius', abbreviation: 'Mat', testament: 'PB', category: 'Injil', chapters_count: 28 },
  { id: 'MRK', name: 'Markus', abbreviation: 'Mrk', testament: 'PB', category: 'Injil', chapters_count: 16 },
  { id: 'LUK', name: 'Lukas', abbreviation: 'Luk', testament: 'PB', category: 'Injil', chapters_count: 24 },
  { id: 'JHN', name: 'Yohanes', abbreviation: 'Yoh', testament: 'PB', category: 'Injil', chapters_count: 21 },
  { id: 'ACT', name: 'Kisah Para Rasul', abbreviation: 'Kis', testament: 'PB', category: 'Sejarah PB', chapters_count: 28 },
  { id: 'ROM', name: 'Roma', abbreviation: 'Rom', testament: 'PB', category: 'Surat Paulus', chapters_count: 16 },
  { id: '1CO', name: '1 Korintus', abbreviation: '1Kor', testament: 'PB', category: 'Surat Paulus', chapters_count: 16 },
  { id: '2CO', name: '2 Korintus', abbreviation: '2Kor', testament: 'PB', category: 'Surat Paulus', chapters_count: 13 },
  { id: 'GAL', name: 'Galatia', abbreviation: 'Gal', testament: 'PB', category: 'Surat Paulus', chapters_count: 6 },
  { id: 'EPH', name: 'Efesus', abbreviation: 'Ef', testament: 'PB', category: 'Surat Paulus', chapters_count: 6 },
  { id: 'PHP', name: 'Filipi', abbreviation: 'Flp', testament: 'PB', category: 'Surat Paulus', chapters_count: 4 },
  { id: 'COL', name: 'Kolose', abbreviation: 'Kol', testament: 'PB', category: 'Surat Paulus', chapters_count: 4 },
  { id: '1TH', name: '1 Tesalonika', abbreviation: '1Tes', testament: 'PB', category: 'Surat Paulus', chapters_count: 5 },
  { id: '2TH', name: '2 Tesalonika', abbreviation: '2Tes', testament: 'PB', category: 'Surat Paulus', chapters_count: 3 },
  { id: '1TI', name: '1 Timotius', abbreviation: '1Tim', testament: 'PB', category: 'Surat Pastoral', chapters_count: 6 },
  { id: '2TI', name: '2 Timotius', abbreviation: '2Tim', testament: 'PB', category: 'Surat Pastoral', chapters_count: 4 },
  { id: 'TIT', name: 'Titus', abbreviation: 'Tit', testament: 'PB', category: 'Surat Pastoral', chapters_count: 3 },
  { id: 'PHM', name: 'Filemon', abbreviation: 'Flm', testament: 'PB', category: 'Surat Paulus', chapters_count: 1 },
  { id: 'HEB', name: 'Ibrani', abbreviation: 'Ibr', testament: 'PB', category: 'Surat Umum', chapters_count: 13 },
  { id: 'JAS', name: 'Yakobus', abbreviation: 'Yak', testament: 'PB', category: 'Surat Umum', chapters_count: 5 },
  { id: '1PE', name: '1 Petrus', abbreviation: '1Pet', testament: 'PB', category: 'Surat Umum', chapters_count: 5 },
  { id: '2PE', name: '2 Petrus', abbreviation: '2Pet', testament: 'PB', category: 'Surat Umum', chapters_count: 3 },
  { id: '1JN', name: '1 Yohanes', abbreviation: '1Yoh', testament: 'PB', category: 'Surat Umum', chapters_count: 5 },
  { id: '2JN', name: '2 Yohanes', abbreviation: '2Yoh', testament: 'PB', category: 'Surat Umum', chapters_count: 1 },
  { id: '3JN', name: '3 Yohanes', abbreviation: '3Yoh', testament: 'PB', category: 'Surat Umum', chapters_count: 1 },
  { id: 'JUD', name: 'Yudas', abbreviation: 'Yud', testament: 'PB', category: 'Surat Umum', chapters_count: 1 },
  { id: 'REV', name: 'Wahyu', abbreviation: 'Why', testament: 'PB', category: 'Nubuat', chapters_count: 22 }
];

// Offline Verses Database for key chapters
export const OFFLINE_VERSES: Record<string, BibleVerse[]> = {
  // Mazmur 23
  'PSA-23': [
    { book_id: 'PSA', book_name: 'Mazmur', chapter: 23, verse: 1, text: 'TUHAN adalah gembalaku, takkan kekurangan aku.' },
    { book_id: 'PSA', book_name: 'Mazmur', chapter: 23, verse: 2, text: 'Ia membaringkan aku di padang yang berumput hijau, Ia membimbing aku ke air yang tenang;' },
    { book_id: 'PSA', book_name: 'Mazmur', chapter: 23, verse: 3, text: 'Ia menyegarkan jiwaku. Ia menuntun aku di jalan yang benar oleh karena nama-Nya.' },
    { book_id: 'PSA', book_name: 'Mazmur', chapter: 23, verse: 4, text: 'Sekalipun aku berjalan dalam lembah kekelaman, aku tidak takut bahaya, sebab Engkau besertaku; gada-Mu dan tongkat-Mu, itulah yang menghibur aku.' },
    { book_id: 'PSA', book_name: 'Mazmur', chapter: 23, verse: 5, text: 'Engkau menyediakan hidangan bagiku, di hadapan lawanku; Engkau mengurapi kepalaku dengan minyak; pialaku penuh melimpah.' },
    { book_id: 'PSA', book_name: 'Mazmur', chapter: 23, verse: 6, text: 'Kebajikan dan kemurahan belaka akan mengikuti aku, seumur hidupku; dan aku akan diam dalam rumah TUHAN sepanjang masa.' }
  ],
  // Mazmur 91 (Ayat 1-16)
  'PSA-91': [
    { book_id: 'PSA', book_name: 'Mazmur', chapter: 91, verse: 1, text: 'Orang yang duduk dalam lindungan Yang Mahatinggi dan bermalam dalam naungan Yang Mahakuasa' },
    { book_id: 'PSA', book_name: 'Mazmur', chapter: 91, verse: 2, text: 'akan berkata kepada TUHAN: "Tempat perlindunganku dan kubu pertahananku, Allahku, yang kupercayai."' },
    { book_id: 'PSA', book_name: 'Mazmur', chapter: 91, verse: 3, text: 'Sungguh, Dialah yang akan melepaskan engkau dari jerat penangkap burung, dari penyakit sampar yang busuk.' },
    { book_id: 'PSA', book_name: 'Mazmur', chapter: 91, verse: 4, text: 'Dengan kepak-Nya Ia akan menudungi engkau, di bawah sayap-Nya engkau akan berlindung, kesetiaan-Nya ialah perisai dan pagar tembok.' },
    { book_id: 'PSA', book_name: 'Mazmur', chapter: 91, verse: 5, text: 'Engkau tak usah takut terhadap kedahsyatan malam, terhadap panah yang terbang di waktu siang,' },
    { book_id: 'PSA', book_name: 'Mazmur', chapter: 91, verse: 6, text: 'terhadap penyakit sampar yang berjalan di dalam gelap, terhadap penyakit menular yang mengamuk di waktu tengah hari.' },
    { book_id: 'PSA', book_name: 'Mazmur', chapter: 91, verse: 7, text: 'Walau seribu orang rebah di sisimu, dan sepuluh ribu di sebelah kananmu, tetapi itu tidak akan menimpamu.' },
    { book_id: 'PSA', book_name: 'Mazmur', chapter: 91, verse: 11, text: 'sebab malaikat-malaikat-Nya akan diperintahkan-Nya kepadamu untuk menjaga engkau di segala jalanmu.' },
    { book_id: 'PSA', book_name: 'Mazmur', chapter: 91, verse: 14, text: '"Sungguh, hatinya melekat kepada-Ku, maka Aku akan meluputkannya, Aku akan membentenginya, sebab ia mengenal nama-Ku.' },
    { book_id: 'PSA', book_name: 'Mazmur', chapter: 91, verse: 15, text: 'Bila ia berseru kepada-Ku, Aku akan menjawab, Aku akan menyertai dia dalam kesesakan, Aku akan meluputkannya dan memuliakannya.' },
    { book_id: 'PSA', book_name: 'Mazmur', chapter: 91, verse: 16, text: 'Dengan panjang umur akan Kukenyangkan dia, dan akan Kuperlihatkan kepadanya keselamatan dari pada-Ku."' }
  ],
  // Mazmur 121
  'PSA-121': [
    { book_id: 'PSA', book_name: 'Mazmur', chapter: 121, verse: 1, text: 'Aku melayangkan mataku ke gunung-gunung; dari manakah akan datang pertolonganku?' },
    { book_id: 'PSA', book_name: 'Mazmur', chapter: 121, verse: 2, text: 'Pertolonganku ialah dari TUHAN, yang menjadikan langit dan bumi.' },
    { book_id: 'PSA', book_name: 'Mazmur', chapter: 121, verse: 3, text: 'Ia takkan membiarkan kakimu goyah, Penjagamu tidak akan terlelap.' },
    { book_id: 'PSA', book_name: 'Mazmur', chapter: 121, verse: 4, text: 'Sesungguhnya tidak terlelap dan tidak tertidur Penjaga Israel.' },
    { book_id: 'PSA', book_name: 'Mazmur', chapter: 121, verse: 5, text: 'TUHANlah Penjagamu, TUHANlah naunganmu di sebelah tangan kananmu.' },
    { book_id: 'PSA', book_name: 'Mazmur', chapter: 121, verse: 7, text: 'TUHAN akan menjaga engkau terhadap segala kecelakaan; Ia akan menjaga nyawamu.' },
    { book_id: 'PSA', book_name: 'Mazmur', chapter: 121, verse: 8, text: 'TUHAN akan menjaga keluar masukmu, dari sekarang sampai selama-lamanya.' }
  ],
  // Yohanes 3
  'JHN-3': [
    { book_id: 'JHN', book_name: 'Yohanes', chapter: 3, verse: 1, text: 'Adalah seorang Farisi yang bernama Nikodemus, seorang pemimpin agama Yahudi.' },
    { book_id: 'JHN', book_name: 'Yohanes', chapter: 3, verse: 3, text: 'Yesus menjawab, kata-Nya: "Aku berkata kepadamu, sesungguhnya jika seorang tidak dilahirkan kembali, ia tidak dapat melihat Kerajaan Allah."' },
    { book_id: 'JHN', book_name: 'Yohanes', chapter: 3, verse: 16, text: 'Karena begitu besar kasih Allah akan dunia ini, sehingga Ia telah mengaruniakan Anak-Nya yang tunggal, supaya setiap orang yang percaya kepada-Nya tidak binasa, melainkan beroleh hidup yang kekal.' },
    { book_id: 'JHN', book_name: 'Yohanes', chapter: 3, verse: 17, text: 'Sebab Allah mengutus Anak-Nya ke dalam dunia bukan untuk menghakimi dunia, melainkan untuk menyelamatkannya oleh Dia.' },
    { book_id: 'JHN', book_name: 'Yohanes', chapter: 3, verse: 36, text: 'Barangsiapa percaya kepada Anak, ia beroleh hidup yang kekal, tetapi barangsiapa tidak taat kepada Anak, ia tidak akan melihat hidup, melainkan murka Allah tetap ada di atasnya.' }
  ],
  // Matius 6 (Doa Bapa Kami & Hal Kekuatiran)
  'MAT-6': [
    { book_id: 'MAT', book_name: 'Matius', chapter: 6, verse: 9, text: 'Karena itu berdoalah demikian: Bapa kami yang di sorga, Dikuduskanlah nama-Mu,' },
    { book_id: 'MAT', book_name: 'Matius', chapter: 6, verse: 10, text: 'datanglah Kerajaan-Mu, jadilah kehendak-Mu di bumi seperti di sorga.' },
    { book_id: 'MAT', book_name: 'Matius', chapter: 6, verse: 11, text: 'Berikanlah kami pada hari ini makanan kami yang secukupnya' },
    { book_id: 'MAT', book_name: 'Matius', chapter: 6, verse: 12, text: 'dan ampunilah kami akan kesalahan kami, seperti kami juga mengampuni orang yang bersalah kepada kami;' },
    { book_id: 'MAT', book_name: 'Matius', chapter: 6, verse: 13, text: 'dan janganlah membawa kami ke dalam pencobaan, tetapi lepaskanlah kami dari pada yang jahat. Karena Engkaulah yang empunya Kerajaan dan kuasa dan kemuliaan sampai selama-lamanya. Amin.' },
    { book_id: 'MAT', book_name: 'Matius', chapter: 6, verse: 33, text: 'Tetapi carilah dahulu Kerajaan Allah dan kebenaran-Nya, maka semuanya itu akan ditambahkan kepadamu.' },
    { book_id: 'MAT', book_name: 'Matius', chapter: 6, verse: 34, text: 'Sebab itu janganlah kamu kuatir akan hari besok, karena hari besok mempunyai kesusahannya sendiri. Kesusahan sehari cukuplah untuk sehari.' }
  ],
  // Filipi 4
  'PHP-4': [
    { book_id: 'PHP', book_name: 'Filipi', chapter: 4, verse: 4, text: 'Bersukacitalah senantiasa dalam Tuhan! Sekali lagi kukatakan: Bersukacitalah!' },
    { book_id: 'PHP', book_name: 'Filipi', chapter: 4, verse: 6, text: 'Janganlah hendaknya kamu kuatir tentang apapun juga, tetapi nyatakanlah dalam segala hal keinginanmu kepada Allah dalam doa dan permohonan dengan ucapan syukur.' },
    { book_id: 'PHP', book_name: 'Filipi', chapter: 4, verse: 7, text: 'Damai sejahtera Allah, yang melampaui segala akal, akan memelihara hati dan pikiranmu dalam Kristus Yesus.' },
    { book_id: 'PHP', book_name: 'Filipi', chapter: 4, verse: 8, text: 'Jadi akhirnya, saudara-saudara, semua yang benar, semua yang mulia, semua yang adil, semua yang suci, semua yang manis, semua yang sedap didengar, semua yang disebut kebajikan dan patut dipuji, pikirkanlah semuanya itu.' },
    { book_id: 'PHP', book_name: 'Filipi', chapter: 4, verse: 13, text: 'Segala perkara dapat kutanggung di dalam Dia yang memberi kekuatan kepadaku.' },
    { book_id: 'PHP', book_name: 'Filipi', chapter: 4, verse: 19, text: 'Allahku akan memenuhi segala keperluanmu menurut kekayaan dan kemuliaan-Nya dalam Kristus Yesus.' }
  ],
  // Roma 8
  'ROM-8': [
    { book_id: 'ROM', book_name: 'Roma', chapter: 8, verse: 1, text: 'Demikianlah sekarang tidak ada penghukuman bagi mereka yang ada di dalam Kristus Yesus.' },
    { book_id: 'ROM', book_name: 'Roma', chapter: 8, verse: 28, text: 'Kita tahu sekarang, bahwa Allah turut bekerja dalam segala sesuatu untuk mendatangkan kebaikan bagi mereka yang mengasihi Dia, yaitu bagi mereka yang terpanggil sesuai dengan rencana Allah.' },
    { book_id: 'ROM', book_name: 'Roma', chapter: 8, verse: 31, text: 'Sebab itu apakah yang akan kita katakan tentang semuanya itu? Jika Allah di pihak kita, siapakah yang akan melawan kita?' },
    { book_id: 'ROM', book_name: 'Roma', chapter: 8, verse: 37, text: 'Tetapi dalam semuanya itu kita lebih dari pada orang-orang yang menang, oleh Dia yang telah mengasihi kita.' },
    { book_id: 'ROM', book_name: 'Roma', chapter: 8, verse: 38, text: 'Sebab aku yakin, bahwa baik maut, maupun hidup, baik malaikat-malaikat, maupun pemerintah-pemerintah, baik yang ada sekarang, maupun yang akan datang,' },
    { book_id: 'ROM', book_name: 'Roma', chapter: 8, verse: 39, text: 'atau kuasa-kuasa, baik yang di atas, maupun yang di bawah, ataupun sesuatu makhluk lain, tidak akan dapat memisahkan kita dari kasih Allah, yang ada dalam Kristus Yesus, Tuhan kita.' }
  ],
  // 1 Korintus 13 (Pasal Kasih)
  '1CO-13': [
    { book_id: '1CO', book_name: '1 Korintus', chapter: 13, verse: 1, text: 'Sekalipun aku dapat berkata-kata dengan semua bahasa manusia dan bahasa malaikat, tetapi jika aku tidak mempunyai kasih, aku sama dengan tembaga yang gemerincing atau canang yang gemerincing.' },
    { book_id: '1CO', book_name: '1 Korintus', chapter: 13, verse: 4, text: 'Kasih itu sabar; kasih itu murah hati; ia tidak cemburu. Ia tidak memegahkan diri dan tidak sombong.' },
    { book_id: '1CO', book_name: '1 Korintus', chapter: 13, verse: 5, text: 'Ia tidak melakukan yang tidak sopan dan tidak mencari keuntungan diri sendiri. Ia tidak pemarah dan tidak menyimpan kesalahan orang lain.' },
    { book_id: '1CO', book_name: '1 Korintus', chapter: 13, verse: 7, text: 'Ia menutupi segala sesuatu, percaya segala sesuatu, mengharapkan segala sesuatu, sabar menanggung segala sesuatu.' },
    { book_id: '1CO', book_name: '1 Korintus', chapter: 13, verse: 8, text: 'Kasih tidak berkesudahan; nubuat akan berakhir; bahasa roh akan berhenti; pengetahuan akan lenyap.' },
    { book_id: '1CO', book_name: '1 Korintus', chapter: 13, verse: 13, text: 'Demikianlah tinggal ketiga hal ini, yaitu iman, pengharapan dan kasih, dan yang paling besar di antaranya ialah kasih.' }
  ],
  // Amsal 3
  'PRO-3': [
    { book_id: 'PRO', book_name: 'Amsal', chapter: 3, verse: 5, text: 'Percayalah kepada TUHAN dengan segenap hatimu, dan janganlah bersandar kepada pengertianmu sendiri.' },
    { book_id: 'PRO', book_name: 'Amsal', chapter: 3, verse: 6, text: 'Akuilah Dia dalam segala lakumu, maka Ia akan meluruskan jalanmu.' },
    { book_id: 'PRO', book_name: 'Amsal', chapter: 3, verse: 9, text: 'Muliakanlah TUHAN dengan hartamu dan dengan hasil pertama dari segala penghasilanmu,' },
    { book_id: 'PRO', book_name: 'Amsal', chapter: 3, verse: 10, text: 'maka lumbung-lumbungmu akan diisi penuh sampai melimpah-limpah, dan bejana pemerasanmu akan meluap dengan air buah anggurnya.' }
  ],
  // Kejadian 1
  'GEN-1': [
    { book_id: 'GEN', book_name: 'Kejadian', chapter: 1, verse: 1, text: 'Pada mulanya Allah menciptakan langit dan bumi.' },
    { book_id: 'GEN', book_name: 'Kejadian', chapter: 1, verse: 2, text: 'Bumi belum berbentuk dan kosong; gelap gulita menutupi samudera raya, dan Roh Allah melayang-layang di atas permukaan air.' },
    { book_id: 'GEN', book_name: 'Kejadian', chapter: 1, verse: 3, text: 'Berfirmanlah Allah: "Jadilah terang." Lalu terang itu jadi.' },
    { book_id: 'GEN', book_name: 'Kejadian', chapter: 1, verse: 4, text: 'Allah melihat bahwa terang itu baik, lalu dipisahkan-Nyalah terang itu dari gelap.' },
    { book_id: 'GEN', book_name: 'Kejadian', chapter: 1, verse: 5, text: 'Dan Allah menamai terang itu siang, dan gelap itu malam. Jadilah petang dan jadilah pagi, itulah hari pertama.' },
    { book_id: 'GEN', book_name: 'Kejadian', chapter: 1, verse: 26, text: 'Berfirmanlah Allah: "Baiklah Kita menjadikan manusia menurut gambar dan rupa Kita, supaya mereka berkuasa atas ikan-ikan di laut dan burung-burung di udara dan atas ternak dan atas seluruh bumi dan atas segala binatang melata yang merayap di bumi."' },
    { book_id: 'GEN', book_name: 'Kejadian', chapter: 1, verse: 27, text: 'Maka Allah menciptakan manusia itu menurut gambar-Nya, menurut gambar Allah diciptakan-Nya dia; laki-laki dan perempuan diciptakan-Nya mereka.' },
    { book_id: 'GEN', book_name: 'Kejadian', chapter: 1, verse: 31, text: 'Maka Allah melihat segala yang dijadikan-Nya itu, sungguh amat baik. Jadilah petang dan jadilah pagi, itulah hari keenam.' }
  ],
  // Mazmur 1 (Jalan Orang Benar dan Jalan Orang Fasik)
  'PSA-1': [
    { book_id: 'PSA', book_name: 'Mazmur', chapter: 1, verse: 1, text: 'Berbahagialah orang yang tidak berjalan menurut nasihat orang fasik, yang tidak berdiri di jalan orang berdosa, dan yang tidak duduk dalam kumpulan pencemooh,' },
    { book_id: 'PSA', book_name: 'Mazmur', chapter: 1, verse: 2, text: 'tetapi yang kesukaannya ialah Taurat TUHAN, dan yang merenungkan Taurat itu siang dan malam.' },
    { book_id: 'PSA', book_name: 'Mazmur', chapter: 1, verse: 3, text: 'Ia seperti pohon, yang ditanam di tepi aliran air, yang menghasilkan buahnya pada musimnya, dan yang tidak layu daunnya; apa saja yang diperbuatnya berhasil.' },
    { book_id: 'PSA', book_name: 'Mazmur', chapter: 1, verse: 4, text: 'Bukan demikian orang fasik: mereka seperti sekam yang ditiupkan angin.' },
    { book_id: 'PSA', book_name: 'Mazmur', chapter: 1, verse: 5, text: 'Sebab itu orang fasik tidak akan tahan dalam penghakiman, begitu pula orang berdosa dalam perkumpulan orang benar;' },
    { book_id: 'PSA', book_name: 'Mazmur', chapter: 1, verse: 6, text: 'sebab TUHAN mengenal jalan orang benar, tetapi jalan orang fasik menuju kebinasaan.' }
  ],
  // Mazmur 100 (Nyanyian Syukur)
  'PSA-100': [
    { book_id: 'PSA', book_name: 'Mazmur', chapter: 100, verse: 1, text: 'Bersorak-soraklah bagi TUHAN, hai seluruh bumi!' },
    { book_id: 'PSA', book_name: 'Mazmur', chapter: 100, verse: 2, text: 'Beribadahlah kepada TUHAN dengan sukacita, datanglah ke hadapan-Nya dengan sorak-sorai!' },
    { book_id: 'PSA', book_name: 'Mazmur', chapter: 100, verse: 3, text: 'Ketahuilah, bahwa TUHANlah Allah; Dialah yang menjadikan kita dan punya Dialah kita, umat-Nya dan kawanan domba gembalaan-Nya.' },
    { book_id: 'PSA', book_name: 'Mazmur', chapter: 100, verse: 4, text: 'Masuklah melalui pintu gerbang-Nya dengan nyanyian syukur, ke dalam pelataran-Nya dengan puji-pujian, bersyukurlah kepada-Nya dan pujilah nama-Nya!' },
    { book_id: 'PSA', book_name: 'Mazmur', chapter: 100, verse: 5, text: 'Sebab TUHAN itu baik, kasih setia-Nya untuk selama-lamanya, dan kesetiaan-Nya tetap turun-temurun.' }
  ],
  // Mazmur 103 (Pujilah TUHAN, Hai Jiwaku)
  'PSA-103': [
    { book_id: 'PSA', book_name: 'Mazmur', chapter: 103, verse: 1, text: 'Pujilah TUHAN, hai jiwaku! Pujilah nama-Nya yang kudus, hai segenap batinku!' },
    { book_id: 'PSA', book_name: 'Mazmur', chapter: 103, verse: 2, text: 'Pujilah TUHAN, hai jiwaku, dan janganlah lupakan segala kebaikan-Nya!' },
    { book_id: 'PSA', book_name: 'Mazmur', chapter: 103, verse: 3, text: 'Dia yang mengampuni segala kesalahanmu, yang menyembuhkan segala penyakitmu,' },
    { book_id: 'PSA', book_name: 'Mazmur', chapter: 103, verse: 4, text: 'Dia yang menebus hidupmu dari lobang kubur, yang memahkotai engkau dengan kasih setia dan rahmat,' },
    { book_id: 'PSA', book_name: 'Mazmur', chapter: 103, verse: 5, text: 'Dia yang memuaskan hasratmu dengan kebaikan, sehingga masa mudamu menjadi baru seperti pada burung rajawali.' },
    { book_id: 'PSA', book_name: 'Mazmur', chapter: 103, verse: 8, text: 'TUHAN adalah penyayang dan pengasih, panjang sabar dan berlimpah kasih setia.' },
    { book_id: 'PSA', book_name: 'Mazmur', chapter: 103, verse: 11, text: 'tetapi setinggi langit di atas bumi, demikian besarnya kasih setia-Nya atas orang-orang yang takut akan Dia;' },
    { book_id: 'PSA', book_name: 'Mazmur', chapter: 103, verse: 12, text: 'sejauh timur dari barat, demikian dijauhkan-Nya dari pada kita pelanggaran kita.' }
  ],
  // Mazmur 139 (Doa di hadapan Allah yang Mahatahu)
  'PSA-139': [
    { book_id: 'PSA', book_name: 'Mazmur', chapter: 139, verse: 1, text: 'TUHAN, Engkau menyelidiki dan mengenal aku;' },
    { book_id: 'PSA', book_name: 'Mazmur', chapter: 139, verse: 2, text: 'Engkau mengetahui, kalau aku duduk atau berdiri, Engkau mengerti pikiranku dari jauh.' },
    { book_id: 'PSA', book_name: 'Mazmur', chapter: 139, verse: 3, text: 'Engkau memeriksa aku, kalau aku berjalan dan berbaring, segala jalanku Kaumaklumi.' },
    { book_id: 'PSA', book_name: 'Mazmur', chapter: 139, verse: 5, text: 'Dari belakang dan dari depan Engkau mengurung aku, dan Engkau menaruh tangan-Mu ke atasku.' },
    { book_id: 'PSA', book_name: 'Mazmur', chapter: 139, verse: 14, text: 'Aku bersyukur kepada-Mu oleh karena kejadianku dahsyat dan ajaib; ajaib apa yang Kaubuat, dan jiwaku benar-benar menyadarinya.' },
    { book_id: 'PSA', book_name: 'Mazmur', chapter: 139, verse: 23, text: 'Selidikilah aku, ya Allah, dan kenallah hatiku, ujilah aku dan kenallah pikiran-pikiranku;' },
    { book_id: 'PSA', book_name: 'Mazmur', chapter: 139, verse: 24, text: 'lihatlah, apakah jalanku serong, dan tuntunlah aku di jalan yang kekal!' }
  ],
  // Yosua 1
  'JOS-1': [
    { book_id: 'JOS', book_name: 'Yosua', chapter: 1, verse: 7, text: 'Hanya, kuatkan dan teguhkanlah hatimu dengan sungguh-sungguh, bertindaklah hati-hati sesuai dengan seluruh hukum yang telah diperintahkan kepadamu oleh hamba-Ku Musa; janganlah menyimpang ke kanan atau ke kiri, supaya engkau beruntung, ke manapun engkau pergi.' },
    { book_id: 'JOS', book_name: 'Yosua', chapter: 1, verse: 8, text: 'Janganlah engkau lupa memperkatakan kitab Taurat ini, tetapi renungkanlah itu siang dan malam, supaya engkau bertindak hati-hati sesuai dengan segala yang tertulis di dalamnya, sebab dengan demikian perjalananmu akan berhasil dan engkau akan beruntung.' },
    { book_id: 'JOS', book_name: 'Yosua', chapter: 1, verse: 9, text: 'Bukankah telah Kuperintahkan kepadamu: kuatkan dan teguhkanlah hatimu? Janganlah kecut dan tawar hati, sebab TUHAN, Allahmu, menyertai engkau, ke manapun engkau pergi.' }
  ],
  // Yesaya 40
  'ISA-40': [
    { book_id: 'ISA', book_name: 'Yesaya', chapter: 40, verse: 28, text: 'Tidakkah kautahu, dan tidakkah kaudengar? TUHAN ialah Allah kekal yang menciptakan bumi dari ujung ke ujung; Ia tidak menjadi lelah dan tidak menjadi lesu, tidak terduga pengertian-Nya.' },
    { book_id: 'ISA', book_name: 'Yesaya', chapter: 40, verse: 29, text: 'Dia memberi kekuatan kepada yang lelah dan menambah semangat kepada yang tiada berdaya.' },
    { book_id: 'ISA', book_name: 'Yesaya', chapter: 40, verse: 30, text: 'Orang-orang muda menjadi lelah dan lesu dan teruna-teruna jatuh tersandung,' },
    { book_id: 'ISA', book_name: 'Yesaya', chapter: 40, verse: 31, text: 'tetapi orang-orang yang menanti-nantikan TUHAN mendapat kekuatan baru: mereka seumpama rajawali yang naik terbang dengan kekuatan sayapnya; mereka berlari dan tidak menjadi lesu, mereka berjalan dan tidak menjadi lelah.' }
  ],
  // Yeremia 29
  'JER-29': [
    { book_id: 'JER', book_name: 'Yeremia', chapter: 29, verse: 11, text: 'Sebab Aku ini mengetahui rancangan-rancangan apa yang ada pada-Ku mengenai kamu, demikianlah firman TUHAN, yaitu rancangan damai sejahtera dan bukan rancangan kecelakaan, untuk memberikan kepadamu hari depan yang penuh harapan.' },
    { book_id: 'JER', book_name: 'Yeremia', chapter: 29, verse: 12, text: 'Dan apabila kamu berseru dan datang untuk berdoa kepada-Ku, maka Aku akan mendengarkan kamu;' },
    { book_id: 'JER', book_name: 'Yeremia', chapter: 29, verse: 13, text: 'apabila kamu mencari Aku, kamu akan menemukan Aku; apabila kamu menanyakan Aku dengan segenap hati,' },
    { book_id: 'JER', book_name: 'Yeremia', chapter: 29, verse: 14, text: 'Aku akan memberi kamu menemukan Aku, demikianlah firman TUHAN.' }
  ],
  // Matius 5 (Khotbah di Bukit / Ucapan Bahagia)
  'MAT-5': [
    { book_id: 'MAT', book_name: 'Matius', chapter: 5, verse: 1, text: 'Ketika Yesus melihat orang banyak itu, naiklah Ia ke atas bukit dan setelah Ia duduk, datanglah murid-murid-Nya kepada-Nya.' },
    { book_id: 'MAT', book_name: 'Matius', chapter: 5, verse: 2, text: 'Maka Yesus pun mulai berbicara dan mengajar mereka, kata-Nya:' },
    { book_id: 'MAT', book_name: 'Matius', chapter: 5, verse: 3, text: '"Berbahagialah orang yang miskin di hadapan Allah, karena merekalah yang empunya Kerajaan Sorga.' },
    { book_id: 'MAT', book_name: 'Matius', chapter: 5, verse: 4, text: 'Berbahagialah orang yang berdukacita, karena mereka akan dihibur.' },
    { book_id: 'MAT', book_name: 'Matius', chapter: 5, verse: 5, text: 'Berbahagialah orang yang lemah lembut, karena mereka akan memiliki bumi.' },
    { book_id: 'MAT', book_name: 'Matius', chapter: 5, verse: 6, text: 'Berbahagialah orang yang lapar dan haus akan kebenaran, karena mereka akan dipuaskan.' },
    { book_id: 'MAT', book_name: 'Matius', chapter: 5, verse: 7, text: 'Berbahagialah orang yang murah hatinya, karena mereka akan beroleh kemurahan.' },
    { book_id: 'MAT', book_name: 'Matius', chapter: 5, verse: 8, text: 'Berbahagialah orang yang suci hatinya, karena mereka akan melihat Allah.' },
    { book_id: 'MAT', book_name: 'Matius', chapter: 5, verse: 9, text: 'Berbahagialah orang yang membawa damai, karena mereka akan disebut anak-anak Allah.' },
    { book_id: 'MAT', book_name: 'Matius', chapter: 5, verse: 14, text: 'Kamu adalah terang dunia. Kota yang terletak di atas gunung tidak mungkin tersembunyi.' },
    { book_id: 'MAT', book_name: 'Matius', chapter: 5, verse: 16, text: 'Demikianlah hendaknya terangmu bercahaya di depan orang, supaya mereka melihat perbuatanmu yang baik dan memuliakan Bapamu yang di sorga."' }
  ],
  // Matius 28 (Amanat Agung)
  'MAT-28': [
    { book_id: 'MAT', book_name: 'Matius', chapter: 28, verse: 18, text: 'Yesus mendekati mereka dan berkata: "Kepada-Ku telah diberikan segala kuasa di sorga dan di bumi.' },
    { book_id: 'MAT', book_name: 'Matius', chapter: 28, verse: 19, text: 'Karena itu pergilah, jadikanlah semua bangsa murid-Ku dan baptislah mereka dalam nama Bapa dan Anak dan Roh Kudus,' },
    { book_id: 'MAT', book_name: 'Matius', chapter: 28, verse: 20, text: 'dan ajarlah mereka melakukan segala sesuatu yang telah Kuperintahkan kepadamu. Dan ketahuilah, Aku menyertai kamu senantiasa sampai kepada akhir zaman."' }
  ],
  // Yohanes 1
  'JHN-1': [
    { book_id: 'JHN', book_name: 'Yohanes', chapter: 1, verse: 1, text: 'Pada mulanya adalah Firman; Firman itu bersama-sama dengan Allah dan Firman itu adalah Allah.' },
    { book_id: 'JHN', book_name: 'Yohanes', chapter: 1, verse: 2, text: 'Ia pada mulanya bersama-sama dengan Allah.' },
    { book_id: 'JHN', book_name: 'Yohanes', chapter: 1, verse: 3, text: 'Segala sesuatu dijadikan oleh Dia dan tanpa Dia tidak ada suatupun yang telah jadi dari segala yang telah dijadikan.' },
    { book_id: 'JHN', book_name: 'Yohanes', chapter: 1, verse: 4, text: 'Dalam Dia ada hidup dan hidup itu adalah terang manusia.' },
    { book_id: 'JHN', book_name: 'Yohanes', chapter: 1, verse: 5, text: 'Terang itu bercahaya di dalam kegelapan dan kegelapan itu tidak menguasainya.' },
    { book_id: 'JHN', book_name: 'Yohanes', chapter: 1, verse: 12, text: 'Tetapi semua orang yang menerima-Nya diberi-Nya kuasa supaya menjadi anak-anak Allah, yaitu mereka yang percaya dalam nama-Nya;' },
    { book_id: 'JHN', book_name: 'Yohanes', chapter: 1, verse: 14, text: 'Firman itu telah menjadi manusia, dan diam di antara kita, dan kita telah melihat kemuliaan-Nya, yaitu kemuliaan yang diberikan kepada-Nya sebagai Anak Tunggal Bapa, penuh kasih karunia dan kebenaran.' }
  ],
  // Yohanes 14
  'JHN-14': [
    { book_id: 'JHN', book_name: 'Yohanes', chapter: 14, verse: 1, text: '"Janganlah gelisah hatimu; percayalah kepada Allah, percayalah juga kepada-Ku.' },
    { book_id: 'JHN', book_name: 'Yohanes', chapter: 14, verse: 2, text: 'Di rumah Bapa-Ku banyak tempat tinggal. Jika tidak demikian, tentu Aku mengatakannya kepadamu. Sebab Aku pergi ke situ untuk menyediakan tempat bagimu.' },
    { book_id: 'JHN', book_name: 'Yohanes', chapter: 14, verse: 3, text: 'Dan apabila Aku telah pergi ke situ dan telah menyediakan tempat bagimu, Aku akan datang kembali dan membawa kamu ke tempat-Ku, supaya di tempat di mana Aku berada, kamupun berada.' },
    { book_id: 'JHN', book_name: 'Yohanes', chapter: 14, verse: 6, text: 'Kata Yesus kepadanya: "Akulah jalan dan kebenaran dan hidup. Tidak ada seorangpun yang datang kepada Bapa, kalau tidak melalui Aku."' },
    { book_id: 'JHN', book_name: 'Yohanes', chapter: 14, verse: 27, text: 'Damai sejahtera Kutinggalkan bagimu. Damai sejahtera-Ku Kuberikan kepadamu, dan apa yang Kuberikan tidak seperti yang diberikan oleh dunia kepadamu. Janganlah gelisah dan gentar hatimu.' }
  ],
  // Yohanes 15 (Pokok Anggur yang Benar)
  'JHN-15': [
    { book_id: 'JHN', book_name: 'Yohanes', chapter: 15, verse: 1, text: '"Akulah pokok anggur yang benar dan Bapa-Kulah pengusahanya.' },
    { book_id: 'JHN', book_name: 'Yohanes', chapter: 15, verse: 4, text: 'Tinggallah di dalam Aku dan Aku di dalam kamu. Sama seperti ranting tidak dapat berbuah dari dirinya sendiri, kalau ia tidak tinggal pada pokok anggur, demikian juga kamu tidak berbuah, jikalau kamu tidak tinggal di dalam Aku.' },
    { book_id: 'JHN', book_name: 'Yohanes', chapter: 15, verse: 5, text: 'Akulah pokok anggur dan kamulah ranting-rantingnya. Barangsiapa tinggal di dalam Aku dan Aku di dalam dia, ia berbuah banyak, sebab di luar Aku kamu tidak dapat berbuat apa-apa.' },
    { book_id: 'JHN', book_name: 'Yohanes', chapter: 15, verse: 7, text: 'Jikalau kamu tinggal di dalam Aku dan firman-Ku tinggal di dalam kamu, mintalah apa saja yang kamu kehendaki, dan kamu akan menerimanya.' },
    { book_id: 'JHN', book_name: 'Yohanes', chapter: 15, verse: 12, text: 'Inilah perintah-Ku, yaitu supaya kamu saling mengasihi, seperti Aku telah mengasihi kamu.' }
  ],
  // Roma 12
  'ROM-12': [
    { book_id: 'ROM', book_name: 'Roma', chapter: 12, verse: 1, text: 'Karena itu, saudara-saudara, demi kemurahan Allah aku menasihatkan kamu, supaya kamu mempersembahkan tubuhmu sebagai persembahan yang hidup, yang kudus dan yang berkenan kepada Allah: itu adalah ibadahmu yang sejati.' },
    { book_id: 'ROM', book_name: 'Roma', chapter: 12, verse: 2, text: 'Janganlah kamu menjadi serupa dengan dunia ini, tetapi berubahlah oleh pembaharuan budimu, sehingga kamu dapat membedakan manakah kehendak Allah: apa yang baik, yang berkenan kepada Allah dan yang sempurna.' },
    { book_id: 'ROM', book_name: 'Roma', chapter: 12, verse: 9, text: 'Hendaklah kasih itu jangan berpura-pura! Jauhilah yang jahat dan lakukanlah yang baik.' },
    { book_id: 'ROM', book_name: 'Roma', chapter: 12, verse: 10, text: 'Hendaklah kamu saling mengasihi sebagai saudara dan saling mendahului dalam memberi hormat.' },
    { book_id: 'ROM', book_name: 'Roma', chapter: 12, verse: 12, text: 'Bersukacitalah dalam pengharapan, sabarlah dalam kesesakan, dan bertekunlah dalam doa!' }
  ],
  // Galatia 5 (Buah Roh)
  'GAL-5': [
    { book_id: 'GAL', book_name: 'Galatia', chapter: 5, verse: 22, text: 'Tetapi buah Roh ialah: kasih, sukacita, damai sejahtera, kesabaran, kemurahan, kebaikan, kesetiaan,' },
    { book_id: 'GAL', book_name: 'Galatia', chapter: 5, verse: 23, text: 'kelemahlembutan, penguasaan diri. Tidak ada hukum yang menentang hal-hal itu.' },
    { book_id: 'GAL', book_name: 'Galatia', chapter: 5, verse: 25, text: 'Jikalau kita hidup oleh Roh, baiklah hidup kita juga dipimpin oleh Roh,' },
    { book_id: 'GAL', book_name: 'Galatia', chapter: 5, verse: 26, text: 'dan janganlah kita gila hormat, janganlah kita saling menantang dan saling mendengki.' }
  ],
  // Efesus 6 (Perlengkapan Senjata Allah)
  'EPH-6': [
    { book_id: 'EPH', book_name: 'Efesus', chapter: 6, verse: 10, text: 'Akhirnya, hendaklah kamu kuat di dalam Tuhan, di dalam kekuatan kuasa-Nya.' },
    { book_id: 'EPH', book_name: 'Efesus', chapter: 6, verse: 11, text: 'Kenakanlah seluruh perlengkapan senjata Allah, supaya kamu dapat bertahan melawan tipu muslihat Iblis;' },
    { book_id: 'EPH', book_name: 'Efesus', chapter: 6, verse: 14, text: 'Jadi berdirilah tegap, berikatpinggangkan kebenaran dan berbajuzirahkan keadilan,' },
    { book_id: 'EPH', book_name: 'Efesus', chapter: 6, verse: 16, text: 'dalam segala keadaan pergunakanlah perisai iman, sebab dengan perisai itu kamu akan dapat memadamkan semua panah api dari si jahat,' },
    { book_id: 'EPH', book_name: 'Efesus', chapter: 6, verse: 17, text: 'dan terimalah ketopong keselamatan dan pedang Roh, yaitu firman Allah,' },
    { book_id: 'EPH', book_name: 'Efesus', chapter: 6, verse: 18, text: 'dalam segala doa dan permohonan. Berdoalah setiap waktu di dalam Roh dan berjaga-jagalah di dalam doamu itu dengan permohonan yang tak putus-putusnya untuk segala orang kudus.' }
  ],
  // Kolose 3
  'COL-3': [
    { book_id: 'COL', book_name: 'Kolose', chapter: 3, verse: 12, text: 'Karena itu, sebagai orang-orang pilihan Allah yang dikuduskan dan dikasihi-Nya, kenakanlah belas kasihan, kemurahan, kerendahan hati, kelemahlembutan dan kesabaran.' },
    { book_id: 'COL', book_name: 'Kolose', chapter: 3, verse: 13, text: 'Sabarlah kamu seorang terhadap yang lain, dan ampunilah seorang akan yang lain apabila yang seorang menaruh dendam terhadap yang lain, sama seperti Tuhan telah mengampuni kamu, kamu perbuat jugalah demikian.' },
    { book_id: 'COL', book_name: 'Kolose', chapter: 3, verse: 14, text: 'Dan di atas semuanya itu: kenakanlah kasih, sebagai pengikat yang mempersatukan dan menyempurnakan.' },
    { book_id: 'COL', book_name: 'Kolose', chapter: 3, verse: 15, text: 'Hendaklah damai sejahtera Kristus memerintah dalam hatimu, karena untuk itulah kamu telah dipanggil menjadi satu tubuh. Dan bersyukurlah.' },
    { book_id: 'COL', book_name: 'Kolose', chapter: 3, verse: 17, text: 'Dan segala sesuatu yang kamu lakukan dengan perkataan atau perbuatan, lakukanlah semuanya itu dalam nama Tuhan Yesus, sambil mengucap syukur oleh Dia kepada Allah, Bapa kita.' }
  ],
  // Ibrani 11 (Saksi-Saksi Iman)
  'HEB-11': [
    { book_id: 'HEB', book_name: 'Ibrani', chapter: 11, verse: 1, text: 'Iman adalah dasar dari segala sesuatu yang kita harapkan dan bukti dari segala sesuatu yang tidak kita lihat.' },
    { book_id: 'HEB', book_name: 'Ibrani', chapter: 11, verse: 3, text: 'Karena iman kita mengerti, bahwa alam semesta telah dijadikan oleh firman Allah, sehingga apa yang kita lihat telah terjadi dari apa yang tidak dapat kita lihat.' },
    { book_id: 'HEB', book_name: 'Ibrani', chapter: 11, verse: 6, text: 'Tetapi tanpa iman tidak mungkin orang berkenan kepada Allah. Sebab barangsiapa berpaling kepada Allah, ia harus percaya bahwa Allah ada, dan bahwa Allah memberi upah kepada orang yang sungguh-sungguh mencari Dia.' }
  ],
  // Wahyu 21 (Langit dan Bumi Baru)
  'REV-21': [
    { book_id: 'REV', book_name: 'Wahyu', chapter: 21, verse: 1, text: 'Lalu aku melihat langit yang baru dan bumi yang baru, sebab langit yang pertama dan bumi yang pertama telah berlalu, dan laut pun tidak ada lagi.' },
    { book_id: 'REV', book_name: 'Wahyu', chapter: 21, verse: 3, text: 'Lalu aku mendengar suara yang nyaring dari takhta itu berkata: "Lihatlah, kemah Allah ada di tengah-tengah manusia dan Ia akan diam bersama-sama dengan mereka. Mereka akan menjadi umat-Nya dan Ia akan menjadi Allah mereka.' },
    { book_id: 'REV', book_name: 'Wahyu', chapter: 21, verse: 4, text: 'Dan Ia akan menghapus segala air mata dari mata mereka, dan maut tidak akan ada lagi; tidak akan ada lagi perkabungan, atau ratap tangis, atau dukacita, sebab segala sesuatu yang lama itu telah berlalu."' },
    { book_id: 'REV', book_name: 'Wahyu', chapter: 21, verse: 5, text: 'Ia yang duduk di atas takhta itu berkata: "Lihatlah, Aku menjadikan segala sesuatu baru!" Dan firman-Nya: "Tuliskanlah, karena segala perkataan ini adalah tepat dan benar."' }
  ]
};

// Ayat-ayat emas tematik pilihan
export const GOLDEN_VERSES: BibleVerse[] = [
  { book_id: 'JHN', book_name: 'Yohanes', chapter: 3, verse: 16, text: 'Karena begitu besar kasih Allah akan dunia ini, sehingga Ia telah mengaruniakan Anak-Nya yang tunggal, supaya setiap orang yang percaya kepada-Nya tidak binasa, melainkan beroleh hidup yang kekal.' },
  { book_id: 'PHP', book_name: 'Filipi', chapter: 4, verse: 13, text: 'Segala perkara dapat kutanggung di dalam Dia yang memberi kekuatan kepadaku.' },
  { book_id: 'PSA', book_name: 'Mazmur', chapter: 23, verse: 1, text: 'TUHAN adalah gembalaku, takkan kekurangan aku.' },
  { book_id: 'PRO', book_name: 'Amsal', chapter: 3, verse: 5, text: 'Percayalah kepada TUHAN dengan segenap hatimu, dan janganlah bersandar kepada pengertianmu sendiri.' },
  { book_id: 'MAT', book_name: 'Matius', chapter: 6, verse: 33, text: 'Tetapi carilah dahulu Kerajaan Allah dan kebenaran-Nya, maka semuanya itu akan ditambahkan kepadamu.' },
  { book_id: 'ROM', book_name: 'Roma', chapter: 8, verse: 28, text: 'Kita tahu sekarang, bahwa Allah turut bekerja dalam segala sesuatu untuk mendatangkan kebaikan bagi mereka yang mengasihi Dia.' },
  { book_id: 'ISA', book_name: 'Yesaya', chapter: 40, verse: 31, text: 'Tetapi orang-orang yang menanti-nantikan TUHAN mendapat kekuatan baru: mereka seumpama rajawali yang naik terbang dengan kekuatan sayapnya; mereka berlari dan tidak menjadi lesu, mereka berjalan dan tidak menjadi lelah.' },
  { book_id: 'JER', book_name: 'Yeremia', chapter: 29, verse: 11, text: 'Sebab Aku ini mengetahui rancangan-rancangan apa yang ada pada-Ku mengenai kamu, demikianlah firman TUHAN, yaitu rancangan damai sejahtera dan bukan rancangan kecelakaan, untuk memberikan kepadamu hari depan yang penuh harapan.' },
  { book_id: 'JOS', book_name: 'Yosua', chapter: 1, verse: 9, text: 'Bukankah telah Kuperintahkan kepadamu: kuatkan dan teguhkanlah hatimu? Janganlah kecut dan tawar hati, sebab TUHAN, Allahmu, menyertai engkau, ke manapun engkau pergi.' },
  { book_id: '1CO', book_name: '1 Korintus', chapter: 13, verse: 13, text: 'Demikianlah tinggal ketiga hal ini, yaitu iman, pengharapan dan kasih, dan yang paling besar di antaranya ialah kasih.' }
];
