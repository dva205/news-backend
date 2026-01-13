'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Insert categories
    const categories = [
      { name: 'Âm nhạc', created_at: new Date(), updated_at: new Date() },
      { name: 'Thể thao', created_at: new Date(), updated_at: new Date() },
      { name: 'Giáo dục', created_at: new Date(), updated_at: new Date() },
      { name: 'Khoa học', created_at: new Date(), updated_at: new Date() },
      { name: 'Giải trí', created_at: new Date(), updated_at: new Date() },
      { name: 'Kinh dị', created_at: new Date(), updated_at: new Date() },
      { name: 'Bạo lực', created_at: new Date(), updated_at: new Date() },
    ];

    await queryInterface.bulkInsert('categories', categories, {});

    // Get category IDs
    const categoryMap = {
      'Âm nhạc': 1,
      'Thể thao': 2,
      'Giáo dục': 3,
      'Khoa học': 4,
      'Giải trí': 5,
      'Kinh dị': 6,
      'Bạo lực': 7,
    };

    // Insert articles
    const articles = [
      {
        title: 'Học đàn piano cho trẻ em',
        content:
          'Piano là một nhạc cụ tuyệt vời để bắt đầu học nhạc. Trẻ em có thể phát triển khả năng tư duy và sáng tạo thông qua âm nhạc.',
        category_id: categoryMap['Âm nhạc'],
        source_url: 'https://example.com/piano-1',
        image_url: 'https://picsum.photos/800/600?random=1',
        age_bucket: '6-10',
        published_at: new Date('2025-11-15'),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        title: 'Bóng đá trẻ em - Lợi ích của việc chơi thể thao',
        content:
          'Bóng đá giúp trẻ phát triển thể chất, học cách làm việc nhóm và rèn luyện tinh thần đồng đội.',
        category_id: categoryMap['Thể thao'],
        source_url: 'https://example.com/football-1',
        image_url: 'https://picsum.photos/800/600?random=2',
        age_bucket: '6-10',
        published_at: new Date('2025-11-14'),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        title: 'Toán học vui - Cách học nhân chia dễ dàng',
        content:
          'Học toán không khó nếu bạn biết cách làm cho nó thú vị. Hãy cùng khám phá các trò chơi toán học.',
        category_id: categoryMap['Giáo dục'],
        source_url: 'https://example.com/math-1',
        image_url: 'https://picsum.photos/800/600?random=3',
        age_bucket: '6-10',
        published_at: new Date('2025-11-13'),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        title: 'Khám phá vũ trụ - Các hành tinh trong hệ mặt trời',
        content:
          'Hệ mặt trời có 8 hành tinh. Sao Thủy gần mặt trời nhất, sao Hải Vương xa nhất.',
        category_id: categoryMap['Khoa học'],
        source_url: 'https://example.com/space-1',
        image_url: 'https://picsum.photos/800/600?random=4',
        age_bucket: '11-15',
        published_at: new Date('2025-11-12'),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        title: 'Phim hoạt hình hay cho trẻ em',
        content:
          'Những bộ phim hoạt hình giáo dục và vui nhộn phù hợp cho trẻ em.',
        category_id: categoryMap['Giải trí'],
        source_url: 'https://example.com/cartoon-1',
        image_url: 'https://picsum.photos/800/600?random=5',
        age_bucket: 'ALL',
        published_at: new Date('2025-11-11'),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        title: 'Concert nhạc Việt - Những bài hát thiếu nhi',
        content: 'Các bài hát thiếu nhi Việt Nam vui tươi và ý nghĩa.',
        category_id: categoryMap['Âm nhạc'],
        source_url: 'https://example.com/concert-1',
        image_url: 'https://picsum.photos/800/600?random=8',
        age_bucket: 'ALL',
        published_at: new Date('2025-11-08'),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        title: 'Truyện ma kinh dị buổi tối',
        content:
          'Những câu chuyện đáng sợ về ma quỷ và bạo lực. Không phù hợp cho trẻ nhỏ.',
        category_id: categoryMap['Kinh dị'],
        source_url: 'https://example.com/horror-1',
        image_url: 'https://picsum.photos/800/600?random=6',
        age_bucket: '16-18',
        published_at: new Date('2025-11-10'),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        title: 'Tin tức về bạo lực và ma túy',
        content:
          'Các vấn đề xã hội liên quan đến bạo lực và ma túy. Nội dung dành cho người lớn.',
        category_id: categoryMap['Bạo lực'],
        source_url: 'https://example.com/violence-1',
        image_url: 'https://picsum.photos/800/600?random=7',
        age_bucket: '16-18',
        published_at: new Date('2025-11-09'),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        title: 'Bơi lội - Môn thể thao toàn diện',
        content:
          'Bơi lội giúp trẻ phát triển toàn diện cơ thể, tăng cường sức khỏe.',
        category_id: categoryMap['Thể thao'],
        source_url: 'https://example.com/swimming-1',
        image_url: 'https://picsum.photos/800/600?random=9',
        age_bucket: '6-10',
        published_at: new Date('2025-11-07'),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        title: 'Học tiếng Anh qua bài hát',
        content:
          'Học tiếng Anh thông qua các bài hát vui nhộn giúp trẻ tiếp thu nhanh hơn.',
        category_id: categoryMap['Giáo dục'],
        source_url: 'https://example.com/english-1',
        image_url: 'https://picsum.photos/800/600?random=10',
        age_bucket: '6-10',
        published_at: new Date('2025-11-06'),
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert('articles', articles, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('articles', null, {});
    await queryInterface.bulkDelete('categories', null, {});
  },
};
