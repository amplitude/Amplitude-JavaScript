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
    navbar: {
      logo: {
        alt: 'Amplitude Logo',
        src: 'img/amp_logo.svg',
      },
      hideOnScroll: true,
      items: [
        {
          to: 'docs/',
          activeBasePath: 'docs',
          label: 'Docs',
          position: 'left',
        },
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
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          // It is recommended to set document id as docs home page (`docs/` path).
          homePageId: 'AmplitudeClient',
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl:
            'https://github.com/facebook/docusaurus/edit/master/website/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
