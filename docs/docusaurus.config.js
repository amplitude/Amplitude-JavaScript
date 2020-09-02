module.exports = {
  title: 'Amplitude JS SDK Docs',
  tagline: 'Amplitude JavaScript SDK',
  url: 'http://amplitude.github.io/Amplitude-JavaScript',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  favicon: 'img/amp_favicon.ico',
  organizationName: 'Amplitude',
  projectName: 'Amplitude-Javascript',
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
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl:
            'https://github.com/amplitude/Amplitude-JavaScript/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
