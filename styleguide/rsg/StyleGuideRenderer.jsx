import React from 'react';
import cx from 'clsx';
import Ribbon from 'react-styleguidist/lib/client/rsg-components/Ribbon';
import Link from 'react-styleguidist/lib/client/rsg-components/Link';
import Styled from 'rsg-components/Styled';

const styles = ({
  color,
  fontFamily,
  fontSize,
  sidebarWidth,
  mq,
  space,
  maxWidth,
}) => ({
  root: {
    minHeight: '100vh',
    backgroundColor: color.baseBackground,
  },
  header: {
    paddingTop: space[[2]],
    paddingBottom: space[[2]],
    marginBottom: space[4],
    borderBottom: [[1, color.border, 'solid']],
    fontFamily: fontFamily.base,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  hasSidebar: {
    paddingLeft: sidebarWidth,
    [mq.small]: {
      paddingLeft: 0,
    },
  },
  content: {
    maxWidth,
    padding: [[space[2], space[4]]],
    margin: [[0, 'auto']],
    [mq.small]: {
      padding: space[2],
    },
    display: 'block',
  },
  sidebar: {
    backgroundColor: color.sidebarBackground,
    border: [[color.border, 'solid']],
    borderWidth: [[0, 1, 0, 0]],
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    width: sidebarWidth,
    overflow: 'auto',
    WebkitOverflowScrolling: 'touch',
    fontFamily: fontFamily.base,
    fontSize: fontSize.small,
    [mq.small]: {
      position: 'static',
      width: 'auto',
      borderWidth: [[1, 0, 0, 0]],
      paddingBottom: space[0],
    },
  },
  logoLink: {
    display: 'inline-block',
    width: '80px',
    textAlign: 'center',
    color: '#49ccef',
    cursor: 'pointer',
  },
  logoImage: {
    width: '100%',
    pointerEvents: 'none',
  },
  logo: {
    padding: space[2],
    borderBottom: [[1, color.border, 'solid']],
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    color: color.light,
    display: 'flex',
    fontFamily: fontFamily.base,
    fontSize: fontSize.small,
    justifyContent: 'center',
    padding: space[2],
    flexDirection: 'column',
  },
});

const CustomStyleGuideRenderer = ({
  classes,
  title,
  version,
  children,
  toc,
  hasSidebar,
}) => {
  return (
    <div className={cx(classes.root, hasSidebar && classes.hasSidebar)}>
      <main className={classes.content}>
        <header className={classes.header}>
          <nav>
            <Link href="https://github.com/wwwebman/react-implicit-auth">
              Github
            </Link>
          </nav>
        </header>
        {children}
        <footer className={classes.footer}>
          <Link href="https://webman.pro">
            <img
              alt="webman.pro logo"
              src="https://webman.pro/logo.svg"
              title="webman.pro"
              width="40"
            />
          </Link>
          <span>
            Developed by{' '}
            <Link href="https://webman.pro" title="webman.pro">
              webman
            </Link>
          </span>
        </footer>
      </main>
      {hasSidebar && (
        <div className={classes.sidebar} data-testid="sidebar">
          <header className={classes.logo}>
            <a href="/" title="Go to start page" className={classes.logoLink}>
              <img
                src="/logo.svg"
                alt="react-implicit-auth logo"
                className={classes.logoImage}
              />
              {version}
            </a>
          </header>
          {toc}
        </div>
      )}
      <Ribbon />
    </div>
  );
};

export default Styled(styles)(CustomStyleGuideRenderer);
