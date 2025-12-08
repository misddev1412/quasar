import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteContentEntity } from '../../modules/site-content/entities/site-content.entity';
import { SiteContentCategory, SiteContentStatus } from '@shared/enums/site-content.enums';

@Injectable()
export class SiteContentSeeder {
  constructor(
    @InjectRepository(SiteContentEntity)
    private readonly siteContentRepository: Repository<SiteContentEntity>,
  ) {}

  async seed(): Promise<void> {
    console.log('Seeding site content...');

    const existingContent = await this.siteContentRepository.count();
    if (existingContent > 0) {
      console.log('Site content already exists, skipping seeding');
      return;
    }

    const siteContentData = [
      {
        code: 'about_us',
        title: 'About Quasar',
        slug: 'about-us',
        category: SiteContentCategory.ABOUT,
        status: SiteContentStatus.PUBLISHED,
        summary: 'Learn more about Quasar and our mission to provide exceptional products and services.',
        content: `
          <h2>Welcome to Quasar</h2>
          <p>At Quasar, we are dedicated to providing exceptional products and services that enhance your daily life. Our mission is to bring innovation and quality together in everything we do.</p>

          <h3>Our Story</h3>
          <p>Founded with a passion for excellence, Quasar has been serving customers worldwide with carefully curated products that meet the highest standards of quality and reliability.</p>

          <h3>Our Values</h3>
          <ul>
            <li><strong>Quality:</strong> We never compromise on quality</li>
            <li><strong>Innovation:</strong> Always pushing boundaries</li>
            <li><strong>Customer Focus:</strong> Your satisfaction is our priority</li>
            <li><strong>Integrity:</strong> Business with honesty and transparency</li>
          </ul>

          <h3>Our Team</h3>
          <p>Our diverse team of professionals brings together expertise from various fields to create a unique shopping experience for our customers.</p>

          <p>Thank you for choosing Quasar. We look forward to serving you!</p>
        `,
        languageCode: 'en',
        publishedAt: new Date(),
        displayOrder: 1,
        isFeatured: true,
        metadata: {
          seoTitle: 'About Quasar - Our Story & Values',
          seoDescription: 'Learn more about Quasar, our mission, values, and commitment to providing exceptional products and services.',
          seoKeywords: ['about', 'quasar', 'company', 'mission', 'values'],
        },
      },
      {
        code: 'privacy_policy',
        title: 'Privacy Policy',
        slug: 'privacy-policy',
        category: SiteContentCategory.POLICY,
        status: SiteContentStatus.PUBLISHED,
        summary: 'Learn how we collect, use, and protect your personal information.',
        content: `
          <h2>Privacy Policy</h2>
          <p><strong>Last updated:</strong> ${new Date().toLocaleDateString()}</p>

          <h3>Information We Collect</h3>
          <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.</p>

          <h3>How We Use Your Information</h3>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve our services</li>
            <li>Process transactions and send related information</li>
            <li>Send technical notices and support messages</li>
            <li>Communicate with you about products, services, and promotional offers</li>
          </ul>

          <h3>Information Sharing</h3>
          <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.</p>

          <h3>Data Security</h3>
          <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>

          <h3>Your Rights</h3>
          <p>You have the right to access, update, or delete your personal information at any time.</p>

          <h3>Contact Us</h3>
          <p>If you have any questions about this Privacy Policy, please contact us at privacy@quasar.com</p>
        `,
        languageCode: 'en',
        publishedAt: new Date(),
        displayOrder: 2,
        isFeatured: false,
        metadata: {
          seoTitle: 'Privacy Policy - Quasar',
          seoDescription: 'Learn how Quasar collects, uses, and protects your personal information in accordance with privacy laws.',
          seoKeywords: ['privacy', 'policy', 'data protection', 'personal information'],
        },
      },
      {
        code: 'terms_of_service',
        title: 'Terms of Service',
        slug: 'terms-of-service',
        category: SiteContentCategory.POLICY,
        status: SiteContentStatus.PUBLISHED,
        summary: 'Read the terms and conditions that govern your use of Quasar services.',
        content: `
          <h2>Terms of Service</h2>
          <p><strong>Last updated:</strong> ${new Date().toLocaleDateString()}</p>

          <h3>Agreement to Terms</h3>
          <p>By accessing and using Quasar, you accept and agree to be bound by the terms and provision of this agreement.</p>

          <h3>Use License</h3>
          <p>Permission is granted to temporarily download one copy of the materials on Quasar for personal, non-commercial transitory viewing only.</p>

          <h3>Disclaimer</h3>
          <p>The materials on Quasar are provided on an 'as is' basis. Quasar makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties.</p>

          <h3>Limitations</h3>
          <p>In no event shall Quasar or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Quasar.</p>

          <h3>Accuracy of Materials</h3>
          <p>The materials appearing on Quasar could include technical, typographical, or photographic errors. Quasar does not warrant that any of the materials on its website are accurate, complete, or current.</p>

          <h3>Modifications</h3>
          <p>Quasar may revise these terms of service at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.</p>

          <h3>Governing Law</h3>
          <p>These terms and conditions are governed by and construed in accordance with the laws of [Your Jurisdiction].</p>
        `,
        languageCode: 'en',
        publishedAt: new Date(),
        displayOrder: 3,
        isFeatured: false,
        metadata: {
          seoTitle: 'Terms of Service - Quasar',
          seoDescription: 'Read the terms and conditions that govern your use of Quasar services and website.',
          seoKeywords: ['terms', 'service', 'conditions', 'legal', 'agreement'],
        },
      },
      {
        code: 'shipping_info',
        title: 'Shipping Information',
        slug: 'shipping-information',
        category: SiteContentCategory.GUIDE,
        status: SiteContentStatus.PUBLISHED,
        summary: 'Everything you need to know about shipping options, delivery times, and tracking.',
        content: `
          <h2>Shipping Information</h2>

          <h3>Shipping Options</h3>
          <p>We offer various shipping options to meet your needs:</p>
          <ul>
            <li><strong>Standard Shipping:</strong> 5-7 business days</li>
            <li><strong>Express Shipping:</strong> 2-3 business days</li>
            <li><strong>Overnight Shipping:</strong> 1 business day</li>
            <li><strong>International Shipping:</strong> 10-15 business days</li>
          </ul>

          <h3>Shipping Rates</h3>
          <p>Shipping rates are calculated based on your location and the weight of your order. You can see the exact shipping cost at checkout.</p>

          <h3>Order Processing Time</h3>
          <p>Orders are typically processed within 1-2 business days before being shipped. You will receive a confirmation email with tracking information once your order ships.</p>

          <h3>Tracking Your Order</h3>
          <p>Once your order ships, you will receive a tracking number via email. You can use this number to track your package on our website or the carrier's website.</p>

          <h3>International Shipping</h3>
          <p>We ship to most countries worldwide. International orders may be subject to customs fees and import duties, which are the responsibility of the recipient.</p>

          <h3>Lost or Damaged Packages</h3>
          <p>If your package is lost or damaged during transit, please contact our customer service team immediately. We will work with the carrier to resolve the issue.</p>
        `,
        languageCode: 'en',
        publishedAt: new Date(),
        displayOrder: 4,
        isFeatured: true,
        metadata: {
          seoTitle: 'Shipping Information - Quasar',
          seoDescription: 'Learn about shipping options, delivery times, rates, and tracking for your Quasar orders.',
          seoKeywords: ['shipping', 'delivery', 'tracking', 'orders', 'logistics'],
        },
      },
      {
        code: 'returns_refunds',
        title: 'Returns & Refunds',
        slug: 'returns-refunds',
        category: SiteContentCategory.GUIDE,
        status: SiteContentStatus.PUBLISHED,
        summary: 'Our return policy and refund procedures for customer satisfaction.',
        content: `
          <h2>Returns & Refunds</h2>

          <h3>Return Policy</h3>
          <p>We want you to be completely satisfied with your purchase. If you're not happy with your order, you can return it within 30 days of delivery.</p>

          <h3>Eligibility for Returns</h3>
          <p>To be eligible for a return, your item must be:</p>
          <ul>
            <li>Unused and in the same condition as received</li>
            <li>In the original packaging</li>
            <li>Accompanied by proof of purchase</li>
          </ul>

          <h3>How to Initiate a Return</h3>
          <ol>
            <li>Contact our customer service team</li>
            <li>Provide your order number and reason for return</li>
            <li>Receive a return authorization and shipping label</li>
            <li>Package the item securely</li>
            <li>Ship the item back to us</li>
          </ol>

          <h3>Refund Process</h3>
          <p>Once we receive your returned item, we will inspect it and notify you of the approval or rejection of your refund. If approved, your refund will be processed within 5-7 business days.</p>

          <h3>Exchange Policy</h3>
          <p>If you'd like to exchange an item for a different size or color, please follow the return process and place a new order for the desired item.</p>

          <h3>Damaged or Defective Items</h3>
          <p>If you receive a damaged or defective item, please contact us immediately with photos of the damage. We will arrange for a replacement or refund at no additional cost to you.</p>

          <h3>Non-returnable Items</h3>
          <p>Some items cannot be returned, including:</p>
          <ul>
            <li>Personalized or customized items</li>
            <li>Perishable goods</li>
            <li>Intimate apparel</li>
            <li>Gift cards</li>
          </ul>
        `,
        languageCode: 'en',
        publishedAt: new Date(),
        displayOrder: 5,
        isFeatured: true,
        metadata: {
          seoTitle: 'Returns & Refunds Policy - Quasar',
          seoDescription: 'Learn about Quasar return policy, refund procedures, and exchange guidelines for customer satisfaction.',
          seoKeywords: ['returns', 'refunds', 'exchange', 'policy', 'customer satisfaction'],
        },
      },
      {
        code: 'faq',
        title: 'Frequently Asked Questions',
        slug: 'faq',
        category: SiteContentCategory.FAQ,
        status: SiteContentStatus.PUBLISHED,
        summary: 'Find answers to common questions about Quasar products and services.',
        content: `
          <h2>Frequently Asked Questions</h2>

          <h3>Order & Payment</h3>

          <h4>What payment methods do you accept?</h4>
          <p>We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and Apple Pay.</p>

          <h4>Is my payment information secure?</h4>
          <p>Yes, we use industry-standard SSL encryption to protect your payment information. Your payment details are never stored on our servers.</p>

          <h4>Can I modify or cancel my order?</h4>
          <p>Orders can be modified or cancelled within 1 hour of placement. After that, please contact customer service for assistance.</p>

          <h3>Shipping & Delivery</h3>

          <h4>How long does shipping take?</h4>
          <p>Standard shipping takes 5-7 business days, while express shipping takes 2-3 business days.</p>

          <h4>Do you ship internationally?</h4>
          <p>Yes, we ship to most countries worldwide. International shipping takes 10-15 business days.</p>

          <h4>How can I track my order?</h4>
          <p>Once your order ships, you'll receive a tracking number via email. You can use this to track your package on our website.</p>

          <h3>Returns & Exchanges</h3>

          <h4>What is your return policy?</h4>
          <p>We offer a 30-day return policy for unused items in original condition.</p>

          <h4>How do I return an item?</h4>
          <p>Contact customer service to initiate a return. We'll provide a return shipping label and instructions.</p>

          <h4>Who pays for return shipping?</h4>
          <p>We provide free return shipping for defective items. For other returns, a small shipping fee may apply.</p>

          <h3>Products & Services</h3>

          <h4>Are your products authentic?</h4>
          <p>Yes, all our products are 100% authentic and sourced directly from manufacturers or authorized distributors.</p>

          <h4>Do you offer warranties?</h4>
          <p>Most products come with manufacturer warranties. Please check product pages for specific warranty information.</p>

          <h4>Can I get product recommendations?</h4>
          <p>Yes! Our customer service team would be happy to provide personalized recommendations based on your needs.</p>

          <h3>Account & Technical</h3>

          <h4>How do I create an account?</h4>
          <p>Click "Sign Up" at the top of our website and follow the registration process.</p>

          <h4>I forgot my password. What should I do?</h4>
          <p>Click "Forgot Password" on the login page and follow the instructions to reset your password.</p>

          <h4>Is my personal information secure?</h4>
          <p>Yes, we take data security seriously and use industry-standard measures to protect your information.</p>
        `,
        languageCode: 'en',
        publishedAt: new Date(),
        displayOrder: 6,
        isFeatured: true,
        metadata: {
          seoTitle: 'FAQ - Frequently Asked Questions - Quasar',
          seoDescription: 'Find answers to common questions about Quasar products, orders, shipping, returns, and more.',
          seoKeywords: ['faq', 'questions', 'answers', 'help', 'support', 'common questions'],
        },
      },
      // Vietnamese versions
      {
        code: 've_quasar',
        title: 'Về Quasar',
        slug: 've-quasar',
        category: SiteContentCategory.ABOUT,
        status: SiteContentStatus.PUBLISHED,
        summary: 'Tìm hiểu thêm về Quasar và sứ mệnh của chúng tôi trong việc cung cấp sản phẩm và dịch vụ xuất sắc.',
        content: `
          <h2>Chào mừng đến với Quasar</h2>
          <p>Tại Quasar, chúng tôi cam kết cung cấp các sản phẩm và dịch vụ xuất sắc giúp nâng cao cuộc sống hàng ngày của bạn. Sứ mệnh của chúng tôi là mang đến sự đổi mới và chất lượng trong mọi thứ chúng tôi làm.</p>

          <h3>Câu chuyện của chúng tôi</h3>
          <p>Được thành lập với niềm đam mê về sự xuất sắc, Quasar đã phục vụ khách hàng trên toàn thế giới với các sản phẩm được tuyển chọn kỹ lưỡng đáp ứng các tiêu chuẩn cao nhất về chất lượng và độ tin cậy.</p>

          <h3>Giá trị của chúng tôi</h3>
          <ul>
            <li><strong>Chất lượng:</strong> Chúng tôi không bao giờ thỏa hiệp về chất lượng</li>
            <li><strong>Đổi mới:</strong> Luôn đẩy mạnh giới hạn</li>
            <li><strong>Lấy khách hàng làm trung tâm:</strong> Sự hài lòng của bạn là ưu tiên của chúng tôi</li>
            <li><strong>Chính trực:</strong> Kinh doanh với sự trung thực và minh bạch</li>
          </ul>

          <h3>Đội ngũ của chúng tôi</h3>
          <p>Đội ngũ chuyên viên đa dạng của chúng tôi kết hợp chuyên môn từ nhiều lĩnh vực khác nhau để tạo ra trải nghiệm mua sắm độc đáo cho khách hàng.</p>

          <p>Cảm ơn bạn đã chọn Quasar. Chúng tôi mong muốn được phục vụ bạn!</p>
        `,
        languageCode: 'vi',
        publishedAt: new Date(),
        displayOrder: 1,
        isFeatured: true,
        metadata: {
          seoTitle: 'Về Quasar - Câu chuyện & Giá trị của chúng tôi',
          seoDescription: 'Tìm hiểu thêm về Quasar, sứ mệnh, giá trị và cam kết của chúng tôi trong việc cung cấp sản phẩm và dịch vụ xuất sắc.',
          seoKeywords: ['về', 'quasar', 'công ty', 'sứ mệnh', 'giá trị'],
        },
      },
      {
        code: 'chinh_sach_bao_mat',
        title: 'Chính sách Bảo mật',
        slug: 'chinh-sach-bao-mat',
        category: SiteContentCategory.POLICY,
        status: SiteContentStatus.PUBLISHED,
        summary: 'Tìm hiểu cách chúng tôi thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn.',
        content: `
          <h2>Chính sách Bảo mật</h2>
          <p><strong>Cập nhật lần cuối:</strong> ${new Date().toLocaleDateString('vi-VN')}</p>

          <h3>Thông tin chúng tôi thu thập</h3>
          <p>Chúng tôi thu thập thông tin bạn cung cấp trực tiếp cho chúng tôi, chẳng hạn như khi bạn tạo tài khoản, mua hàng hoặc liên hệ chúng tôi để hỗ trợ.</p>

          <h3>Cách chúng tôi sử dụng thông tin của bạn</h3>
          <p>Chúng tôi sử dụng thông tin thu thập được để:</p>
          <ul>
            <li>Cung cấp, duy trì và cải thiện dịch vụ của chúng tôi</li>
            <li>Xử lý giao dịch và gửi thông tin liên quan</li>
            <li>Gửi thông báo kỹ thuật và tin nhắn hỗ trợ</li>
            <li>Liên lạc với bạn về sản phẩm, dịch vụ và các ưu đãi khuyến mãi</li>
          </ul>

          <h3>Chia sẻ thông tin</h3>
          <p>Chúng tôi không bán, trao đổi hoặc chuyển giao thông tin cá nhân của bạn cho bên thứ ba mà không có sự đồng ý của bạn, ngoại trừ như được mô tả trong chính sách này.</p>

          <h3>Bảo mật dữ liệu</h3>
          <p>Chúng tôi thực hiện các biện pháp kỹ thuật và tổ chức phù hợp để bảo vệ thông tin cá nhân của bạn chống lại việc truy cập, thay đổi, tiết lộ hoặc phá hủy trái phép.</p>

          <h3>Quyền của bạn</h3>
          <p>Bạn có quyền truy cập, cập nhật hoặc xóa thông tin cá nhân của mình bất cứ lúc nào.</p>

          <h3>Liên hệ chúng tôi</h3>
          <p>Nếu bạn có bất kỳ câu hỏi nào về Chính sách Bảo mật này, vui lòng liên hệ chúng tôi tại privacy@quasar.com</p>
        `,
        languageCode: 'vi',
        publishedAt: new Date(),
        displayOrder: 2,
        isFeatured: false,
        metadata: {
          seoTitle: 'Chính sách Bảo mật - Quasar',
          seoDescription: 'Tìm hiểu cách Quasar thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn tuân thủ các luật về bảo mật.',
          seoKeywords: ['bảo mật', 'chính sách', 'bảo vệ dữ liệu', 'thông tin cá nhân'],
        },
      },
    ];

    for (const contentData of siteContentData) {
      const content = this.siteContentRepository.create(contentData);
      await this.siteContentRepository.save(content);
    }

    console.log(`Seeded ${siteContentData.length} site content items`);
  }
}