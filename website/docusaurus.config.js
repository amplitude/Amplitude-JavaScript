module.exports = {
  title: 'Amplitude JS SDK Docs',
  tagline: 'Amplitude JavaScript SDK',
  url: 'https://amplitude.github.io',
  baseUrl: '/Amplitude-JavaScript/',
  onBrokenLinks: 'throw',
  favicon: 'img/amp_favicon.ico',
  organizationName: 'Amplitude',
  projectName: 'Amplitude-JavaScript',
  themeConfig: {
    sidebarCollapsible: false,
    navbar: {
      logo: {
        alt: 'Amplitude Logo',
        src: 'img/amp_logo.svg',
      },
      hideOnScroll: true,
      items: [
        {
          href: 'https://github.com/amplitude/Amplitude-JavaScript/',
          label: 'GitHub',
          position: 'left',
        },
      ],
    },
    footer: {
      logo: {
        alt: 'Amplitude Logo',
        src: 'img/amp_logo.svg',
      },
      copyright: `Copyright © ${new Date().getFullYear()} Amplitude, Inc.`,
    },
    prism: {
      defaultLanguage: 'javascript',
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          homePageId: 'AmplitudeClient',
          path: 'docs',
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/amplitude/Amplitude-JavaScript/website',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
