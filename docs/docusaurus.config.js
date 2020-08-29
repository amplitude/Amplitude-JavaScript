module.exports = {
  title: 'My Site',
  tagline: 'The tagline of my site',
  url: 'https://your-docusaurus-test-site.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  favicon: 'img/amp_favicon.ico',
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
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Style Guide',
              to: 'docs/',
            },
            {
              label: 'Second Doc',
              to: 'docs/doc2/',
            },
            {
              label: 'Help Center',
              href: 'https://help.amplitude.com/',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Github Repository',
              href: 'https://github.com/amplitude/Amplitude-javascript',
            },
            {
              label: 'Releases',
              href: 'https://github.com/amplitude/Amplitude-Javascript/releases'
            },
            {
              label: 'npm Registry',
              href: 'https://www.npmjs.com/package/amplitude-js',
            },
          ],
        },
        {
          title: 'Other SDKs',
          items: [
            {
              label: 'iOS/tvOS/macOS',
              href: 'https://developers.amplitude.com/docs/ios',
            },
            {
              label: 'Android',
              href: 'https://developers.amplitude.com/docs/android',
            },
            {
              label: 'Unity',
              href: 'https://developers.amplitude.com/docs/unity',
            },
            {
              label: 'Flutter',
              href: 'https://developers.amplitude.com/docs/flutter',
            },
            {
              label: 'Node.js',
              href: 'https://developers.amplitude.com/docs/nodejs',
            },
          ],
        },
      ],
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
          homePageId: 'doc1',
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
