import React from 'react';

const Marquee = ({ children, reverse = false, pauseOnHover = false, className = "" }) => {
  return (
    <div className={`group flex overflow-hidden ${className}`} style={{ userSelect: 'none' }}>
      <div className={`flex min-w-full shrink-0 gap-6 animate-scroll ${reverse ? 'direction-reverse' : ''} ${pauseOnHover ? 'group-hover:paused' : ''}`}>
        {children}
      </div>
      <div className={`flex min-w-full shrink-0 gap-6 animate-scroll ${reverse ? 'direction-reverse' : ''} ${pauseOnHover ? 'group-hover:paused' : ''}`}>
        {children}
      </div>
    </div>
  );
};

const ImageCard = ({ img }) => {
  return (
    <div className="relative h-16  rounded-lg duration-300">
      <img
        className="h-full object-cover"
        alt=""
        src={img}
      />
    </div>
  );
};

export default function ImageCarousel() {
const images = [
  "https://cdn-icons-png.flaticon.com/512/10701/10701004.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Figma-logo.svg/1667px-Figma-logo.svg.png",
  "https://img.icons8.com/?size=1200&id=17949&format=jpg",
  "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/google-ads-icon.png",
  "https://img.freepik.com/vecteurs-premium/plante-interieur-ampoule-concept-energie-verte-concept-electricite-verte_1174662-222.jpg",
  "https://cdn.worldvectorlogo.com/logos/google-analytics-3.svg",
  "https://cdn-icons-png.flaticon.com/512/5968/5968672.png", // Bootstrap
  "https://cdn-icons-png.flaticon.com/512/919/919851.png", // React
  "https://cdn-icons-png.flaticon.com/512/5968/5968381.png", // TypeScript
  "https://cdn-icons-png.flaticon.com/512/5968/5968292.png", // JavaScript
  "https://cdn-icons-png.flaticon.com/512/732/732212.png", // HTML5
  "https://cdn-icons-png.flaticon.com/512/732/732190.png", // CSS3
  "https://cdn.worldvectorlogo.com/logos/nodejs-icon.svg", // Node.js
  "https://cdn.worldvectorlogo.com/logos/tailwindcss.svg", // Tailwind
  "https://cdn.worldvectorlogo.com/logos/mongodb-icon-1.svg", // MongoDB
  "https://cdn.worldvectorlogo.com/logos/firebase-1.svg", // Firebase
  "https://cdn.worldvectorlogo.com/logos/git-icon.svg", // Git
  "https://cdn.worldvectorlogo.com/logos/visual-studio-code-1.svg", // VS Code
  "https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg", // Slack
  "https://cdn.worldvectorlogo.com/logos/notion-logo-1.svg", // Notion
  "https://cdn.worldvectorlogo.com/logos/webpack-icon.svg", // Webpack
  "https://cdn.worldvectorlogo.com/logos/sass-1.svg", // Sass
  "https://cdn.worldvectorlogo.com/logos/python-5.svg", // Python
  "https://cdn.worldvectorlogo.com/logos/docker-4.svg", // Docker
  "https://cdn.worldvectorlogo.com/logos/postgresql.svg", // PostgreSQL
  "https://cdn.worldvectorlogo.com/logos/redux.svg", // Redux
  "https://cdn.worldvectorlogo.com/logos/nextjs-2.svg", // Next.js
  "https://cdn.worldvectorlogo.com/logos/vue-9.svg", // Vue.js
  "https://cdn.worldvectorlogo.com/logos/angular-icon-1.svg", // Angular
  "https://cdn.worldvectorlogo.com/logos/github-icon-1.svg", // GitHub
  "https://cdn.worldvectorlogo.com/logos/gitlab.svg", // GitLab
  "https://cdn.worldvectorlogo.com/logos/jira-1.svg", // Jira
  "https://cdn.worldvectorlogo.com/logos/trello.svg", // Trello
  "https://cdn.worldvectorlogo.com/logos/adobe-xd-1.svg", // Adobe XD
  "https://cdn.worldvectorlogo.com/logos/adobe-photoshop-2.svg", // Photoshop
  "https://cdn.worldvectorlogo.com/logos/adobe-illustrator-cc-2019.svg", // Illustrator
  "https://cdn.worldvectorlogo.com/logos/stripe-4.svg", // Stripe
  "https://cdn.worldvectorlogo.com/logos/google-cloud-1.svg", // Google Cloud
  "https://cdn.worldvectorlogo.com/logos/aws-2.svg", // AWS
  "https://cdn.worldvectorlogo.com/logos/vercel.svg", // Vercel
  "https://cdn.worldvectorlogo.com/logos/graphql.svg", // GraphQL
  "https://cdn.worldvectorlogo.com/logos/jest-2.svg", // Jest
  "https://cdn.worldvectorlogo.com/logos/mysql-6.svg", // MySQL
  "https://cdn.worldvectorlogo.com/logos/redis.svg", // Redis
  "https://cdn.worldvectorlogo.com/logos/elasticsearch.svg", // Elasticsearch
  "https://cdn.worldvectorlogo.com/logos/kubernetes.svg", // Kubernetes
  "https://cdn.worldvectorlogo.com/logos/jenkins-1.svg", // Jenkins
  "https://cdn.worldvectorlogo.com/logos/nginx-1.svg", // Nginx
  "https://cdn.worldvectorlogo.com/logos/apache.svg", // Apache
  "https://cdn.worldvectorlogo.com/logos/wordpress-blue.svg", // WordPress
  "https://cdn.worldvectorlogo.com/logos/shopify.svg", // Shopify
  "https://cdn.worldvectorlogo.com/logos/woocommerce.svg", // WooCommerce
  "https://cdn.worldvectorlogo.com/logos/magento.svg", // Magento
  "https://cdn.worldvectorlogo.com/logos/drupal.svg", // Drupal
  "https://cdn.worldvectorlogo.com/logos/laravel-2.svg", // Laravel
  "https://cdn.worldvectorlogo.com/logos/symfony.svg", // Symfony
  "https://cdn.worldvectorlogo.com/logos/django.svg", // Django
  "https://cdn.worldvectorlogo.com/logos/flask.svg", // Flask
  "https://cdn.worldvectorlogo.com/logos/ruby.svg", // Ruby
  "https://cdn.worldvectorlogo.com/logos/java-4.svg", // Java
  "https://cdn.worldvectorlogo.com/logos/spring-3.svg", // Spring
  "https://cdn.worldvectorlogo.com/logos/c-1.svg", // C#
  "https://cdn.worldvectorlogo.com/logos/dot-net-core-7.svg", // .NET Core
  "https://cdn.worldvectorlogo.com/logos/php-1.svg", // PHP
  "https://cdn.worldvectorlogo.com/logos/go-8.svg", // Go
  "https://cdn.worldvectorlogo.com/logos/rust.svg", // Rust
  "https://cdn.worldvectorlogo.com/logos/swift-15.svg", // Swift
  "https://cdn.worldvectorlogo.com/logos/kotlin-1.svg", // Kotlin
  "https://cdn.worldvectorlogo.com/logos/flutter.svg", // Flutter
  "https://cdn.worldvectorlogo.com/logos/react-native-1.svg", // React Native
  "https://cdn.worldvectorlogo.com/logos/ionic-icon.svg", // Ionic
  "https://cdn.worldvectorlogo.com/logos/electron-1.svg", // Electron
  "https://cdn.worldvectorlogo.com/logos/unity-69.svg", // Unity
  "https://cdn.worldvectorlogo.com/logos/unreal-engine-1.svg", // Unreal Engine
  "https://cdn.worldvectorlogo.com/logos/blender-2.svg", // Blender
  "https://cdn.worldvectorlogo.com/logos/figma-5.svg", // Figma alt
  "https://cdn.worldvectorlogo.com/logos/sketch-2.svg", // Sketch
  "https://cdn.worldvectorlogo.com/logos/invision.svg", // InVision
  "https://cdn.worldvectorlogo.com/logos/framer-motion.svg", // Framer
  "https://cdn.worldvectorlogo.com/logos/postman.svg", // Postman
  "https://cdn.worldvectorlogo.com/logos/insomnia.svg", // Insomnia
  "https://cdn.worldvectorlogo.com/logos/swagger.svg", // Swagger
  "https://cdn.worldvectorlogo.com/logos/sentry-3.svg", // Sentry
  "https://cdn.worldvectorlogo.com/logos/datadog.svg", // Datadog
  "https://cdn.worldvectorlogo.com/logos/new-relic.svg", // New Relic
  "https://cdn.worldvectorlogo.com/logos/grafana.svg", // Grafana
  "https://cdn.worldvectorlogo.com/logos/prometheus.svg", // Prometheus
  "https://cdn.worldvectorlogo.com/logos/terraform-enterprise.svg", // Terraform
  "https://cdn.worldvectorlogo.com/logos/ansible.svg", // Ansible
  "https://cdn.worldvectorlogo.com/logos/circleci.svg", // CircleCI
  "https://cdn.worldvectorlogo.com/logos/travis-ci.svg", // Travis CI
  "https://cdn.worldvectorlogo.com/logos/bitbucket.svg", // Bitbucket
  "https://cdn.worldvectorlogo.com/logos/atlassian.svg", // Atlassian
  "https://cdn.worldvectorlogo.com/logos/confluence-1.svg", // Confluence
  "https://cdn.worldvectorlogo.com/logos/asana-logo.svg", // Asana
  "https://cdn.worldvectorlogo.com/logos/monday-icon.svg", // Monday.com
  "https://cdn.worldvectorlogo.com/logos/clickup.svg", // ClickUp
  "https://cdn.worldvectorlogo.com/logos/miro-2.svg", // Miro
  "https://cdn.worldvectorlogo.com/logos/zoom-communications-logo.svg", // Zoom
  "https://cdn.worldvectorlogo.com/logos/microsoft-teams-1.svg", // Teams
  "https://cdn.worldvectorlogo.com/logos/discord-6.svg", // Discord
  "https://cdn.worldvectorlogo.com/logos/telegram-1.svg", // Telegram
  "https://cdn.worldvectorlogo.com/logos/whatsapp-4.svg", // WhatsApp
  "https://cdn.worldvectorlogo.com/logos/mailchimp-freddie-icon.svg", // Mailchimp
  "https://cdn.worldvectorlogo.com/logos/hubspot-1.svg", // HubSpot
  "https://cdn.worldvectorlogo.com/logos/salesforce-2.svg", // Salesforce
  "https://cdn.worldvectorlogo.com/logos/intercom-1.svg", // Intercom
  "https://cdn.worldvectorlogo.com/logos/zendesk-1.svg", // Zendesk
  "https://cdn.worldvectorlogo.com/logos/zapier.svg", // Zapier
  "https://cdn.worldvectorlogo.com/logos/airtable.svg", // Airtable
  "https://cdn.worldvectorlogo.com/logos/google-drive.svg", // Google Drive
  "https://cdn.worldvectorlogo.com/logos/dropbox-1.svg", // Dropbox
  "https://cdn.worldvectorlogo.com/logos/onedrive-1.svg", // OneDrive
  "https://cdn.worldvectorlogo.com/logos/paypal-3.svg", // PayPal
  "https://cdn.worldvectorlogo.com/logos/square-1.svg", // Square
  "https://cdn.worldvectorlogo.com/logos/linkedin-icon-2.svg", // LinkedIn
  "https://cdn.worldvectorlogo.com/logos/twitter-6.svg", // Twitter/X
  "https://cdn.worldvectorlogo.com/logos/facebook-4.svg", // Facebook
  "https://cdn.worldvectorlogo.com/logos/instagram-2016-5.svg", // Instagram
  "https://cdn.worldvectorlogo.com/logos/youtube-icon.svg", // YouTube
  "https://cdn.worldvectorlogo.com/logos/tiktok-icon.svg", // TikTok
  "https://cdn.worldvectorlogo.com/logos/pinterest-1.svg", // Pinterest
  "https://cdn.worldvectorlogo.com/logos/reddit-4.svg", // Reddit
  "https://cdn.worldvectorlogo.com/logos/medium-1.svg", // Medium
  "https://cdn.worldvectorlogo.com/logos/stackoverflow.svg", // Stack Overflow
  "https://cdn.worldvectorlogo.com/logos/codepen-icon.svg", // CodePen
  "https://cdn.worldvectorlogo.com/logos/dribbble-icon.svg", // Dribbble
  "https://cdn.worldvectorlogo.com/logos/behance.svg" // Behance
];

  const firstRow = images.slice(0);

  return (
    <div className="py-5">
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .animate-scroll {
          animation: scroll var(--duration, 30s) linear infinite;
        }
        .direction-reverse {
          animation-direction: reverse;
        }
        .group:hover .group-hover\\:paused {
          animation-play-state: paused;
        }
      `}</style>
      
        <div className="mt-10 relative flex flex-col py-3 items-center justify-center lg:w-full w-screen overflow-hidden gap-6">
          <Marquee pauseOnHover className="[--duration:160s]">
            {firstRow.map((image, idx) => (
              <ImageCard key={idx} img={image} />
            ))}
          </Marquee>
          <div className="absolute inset-y-0 left-0 w-24 pointer-events-none bg-gradient-to-r from-white"></div>
          <div className="absolute inset-y-0 right-0 w-24 pointer-events-none bg-gradient-to-l from-white"></div>
      
      </div>
    </div>
  );
}