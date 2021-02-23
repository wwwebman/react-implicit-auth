const theme = {
  maxWidth: 850,
  sidebarWidth: 250,
};

const styles = ({ borderRadius, fontSize }) => {
  return {
    Heading: {
      heading: {
        margin: '1em 0 0.5em',
      },
      heading1: {
        textAlign: 'center',
      },
    },
    Code: {
      code: {
        background: 'whitesmoke',
        borderRadius,
        fontSize: fontSize.small,
        padding: '0.1rem 0.25rem',
        verticalAlign: 'middle',
        whiteSpace: 'nowrap',
        color: '#000',
      },
    },
    Table: {
      cell: {
        '& p': {
          fontSize: fontSize.small,
          lineHeight: 1.4,
        },
      },
    },
  };
};

module.exports = {
  styles,
  theme,
};
