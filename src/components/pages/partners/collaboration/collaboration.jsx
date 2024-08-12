import Image from 'next/image';

import Container from 'components/shared/container';
import GradientCard from 'components/shared/gradient-card';
import GradientLabel from 'components/shared/gradient-label';
import Link from 'components/shared/link/link';
import LINKS from 'constants/links';
import ArrowIcon from 'icons/arrow-sm.inline.svg';

import koyeb from './images/koyeb.svg';
import replit from './images/replit.svg';
import retool from './images/retool.svg';
import vercel from './images/vercel.svg';

const partners = [
  {
    logo: { icon: retool, alt: 'Retool', width: 141, height: 40 },
    description: `“Our users spend less time on setup and more time on building: they can <span>turn spreadsheet-based processes into secure and scalable apps</span> all in just a few minutes”`,
    linkUrl: `${LINKS.blog}/how-retool-uses-retool-and-the-neon-api-to-manage-300k-postgres-databases`,
  },
  {
    logo: { icon: vercel, alt: 'Vercel', width: 154, height: 40 },
    description: `“By partnering with Neon, Vercel’s frontend platform is now <span>the end-to-end serverless solution</span> for building on the Web”`,
    linkUrl: `${LINKS.blog}/neon-postgres-on-vercel`,
  },
  {
    logo: { icon: koyeb, alt: 'Koyeb', width: 138, height: 40 },
    description: `“Our users can now <span>build, run, and scale their full stack apps</span> and manage their databases on a single platform with a unified experience”`,
    linkUrl: 'https://www.koyeb.com/blog/serverless-postgres-public-preview',
  },
  {
    logo: { icon: replit, alt: 'Replit', width: 153, height: 40 },
    description:
      '“We want to make it seamless to develop applications on Replit. Our users can now <span>create and instantly begin to use Postgres databases</span> from within the Replit workspace”',
    linkUrl: `${LINKS.blog}/neon-replit-integration`,
  },
];

const Collaboration = () => (
  <section className="collaboration safe-paddings mt-[152px] 2xl:mt-36 lg:mt-28 md:mt-20">
    <Container className="grid-gap-x grid grid-cols-12" size="medium">
      <div className="col-span-8 col-start-3 flex flex-col items-center xl:col-span-10 xl:col-start-2 lg:col-span-full lg:col-start-1">
        <GradientLabel>Case studies</GradientLabel>
        <h2 className="mt-4 text-center font-title text-[48px] font-medium leading-none tracking-extra-tight lg:text-4xl sm:text-[36px]">
          Success stories
        </h2>
        <p className="mt-3 text-center text-lg font-light leading-snug sm:text-base">
          Learn the benefits directly from our partners.
        </p>

        {/* cards */}
        <ul className="mt-12 grid grid-cols-2 gap-10 lg:gap-8 md:gap-6 sm:grid-cols-1">
          {partners.map(({ logo, linkUrl, description }, index) => {
            const isExternal = linkUrl.startsWith('http');

            return (
              <li key={index}>
                <GradientCard
                  className="block p-7"
                  as={Link}
                  to={linkUrl}
                  target={isExternal ? '_blank' : undefined}
                >
                  <div className="flex h-full flex-col">
                    <Image
                      className="mb-10"
                      src={logo.icon}
                      alt={logo.alt}
                      width={logo.width}
                      height={logo.height}
                    />
                    <p
                      className="mb-3.5 font-light leading-snug text-gray-new-60 [&_span]:font-normal [&_span]:text-gray-new-80"
                      dangerouslySetInnerHTML={{ __html: description }}
                    />
                    <div className="mt-auto inline-flex items-baseline text-[15px] leading-none tracking-extra-tight text-green-45 transition-colors duration-200 group-hover:text-[#00FFAA]">
                      Read more
                      <ArrowIcon className="ml-1" />
                    </div>
                  </div>
                </GradientCard>
              </li>
            );
          })}
        </ul>
      </div>
    </Container>
  </section>
);

export default Collaboration;
