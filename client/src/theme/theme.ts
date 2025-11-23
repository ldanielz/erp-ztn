import { createTheme, alpha } from '@mui/material/styles'

// Minimals-inspired palette
const palette = {
    primary: {
        main: '#00AB55',
        light: '#36D375',
        dark: '#007B55',
        contrastText: '#fff'
    },
    secondary: {
        main: '#3366FF',
        light: '#84A9FF',
        dark: '#1939B7',
        contrastText: '#fff'
    },
    info: {
        main: '#1890FF',
        light: '#74CAFF',
        dark: '#0C53B7',
        contrastText: '#fff'
    },
    success: {
        main: '#54D62C',
        light: '#AAF27F',
        dark: '#229A16',
        contrastText: '#212B36'
    },
    warning: {
        main: '#FFC107',
        light: '#FFE16A',
        dark: '#B78103',
        contrastText: '#212B36'
    },
    error: {
        main: '#FF4842',
        light: '#FFA48D',
        dark: '#B72136',
        contrastText: '#fff'
    },
    grey: {
        0: '#FFFFFF',
        100: '#F9FAFB',
        200: '#F4F6F8',
        300: '#DFE3E8',
        400: '#C4CDD5',
        500: '#919EAB',
        600: '#637381',
        700: '#454F5B',
        800: '#212B36',
        900: '#161C24'
    },
    text: {
        primary: '#212B36',
        secondary: '#637381',
        disabled: '#919EAB'
    },
    background: {
        default: '#F9FAFB', // Neutral background
        paper: '#FFFFFF'
    },
    action: {
        active: '#637381',
        hover: alpha('#919EAB', 0.08),
        selected: alpha('#919EAB', 0.16),
        disabled: alpha('#919EAB', 0.8),
        disabledBackground: alpha('#919EAB', 0.24),
        focus: alpha('#919EAB', 0.24),
        hoverOpacity: 0.08,
        disabledOpacity: 0.48
    }
}

// Typography
const typography = {
    fontFamily: "'Public Sans', 'Inter', sans-serif",
    h1: { fontWeight: 700, fontSize: '4rem' },
    h2: { fontWeight: 700, fontSize: '3rem' },
    h3: { fontWeight: 700, fontSize: '2rem' },
    h4: { fontWeight: 700, fontSize: '1.5rem' },
    h5: { fontWeight: 700, fontSize: '1.25rem' },
    h6: { fontWeight: 700, fontSize: '1.125rem' },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    body1: { lineHeight: 1.5 },
    body2: { lineHeight: 1.5 },
    button: { fontWeight: 700, textTransform: 'none' as const }
}

// Shadows
const shadows = [
    'none',
    '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
    '0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)',
    '0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)',
    '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)',
    '0px 3px 5px -1px rgba(0,0,0,0.2),0px 5px 8px 0px rgba(0,0,0,0.14),0px 1px 14px 0px rgba(0,0,0,0.12)',
    '0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)',
    '0px 4px 5px -2px rgba(0,0,0,0.2),0px 7px 10px 1px rgba(0,0,0,0.14),0px 2px 16px 1px rgba(0,0,0,0.12)',
    '0 8px 16px 0 rgba(145, 158, 171, 0.16)', // Custom soft shadow
    '0px 5px 6px -3px rgba(0,0,0,0.2),0px 9px 12px 1px rgba(0,0,0,0.14),0px 3px 16px 2px rgba(0,0,0,0.12)',
    '0px 6px 6px -3px rgba(0,0,0,0.2),0px 10px 14px 1px rgba(0,0,0,0.14),0px 4px 18px 3px rgba(0,0,0,0.12)',
    '0px 6px 7px -4px rgba(0,0,0,0.2),0px 11px 15px 1px rgba(0,0,0,0.14),0px 4px 20px 3px rgba(0,0,0,0.12)',
    '0px 7px 8px -4px rgba(0,0,0,0.2),0px 12px 17px 2px rgba(0,0,0,0.14),0px 5px 22px 4px rgba(0,0,0,0.12)',
    '0px 7px 8px -4px rgba(0,0,0,0.2),0px 13px 19px 2px rgba(0,0,0,0.14),0px 5px 24px 4px rgba(0,0,0,0.12)',
    '0px 7px 9px -4px rgba(0,0,0,0.2),0px 14px 21px 2px rgba(0,0,0,0.14),0px 5px 26px 4px rgba(0,0,0,0.12)',
    '0px 8px 9px -5px rgba(0,0,0,0.2),0px 15px 22px 2px rgba(0,0,0,0.14),0px 6px 28px 5px rgba(0,0,0,0.12)',
    '0px 8px 10px -5px rgba(0,0,0,0.2),0px 16px 24px 2px rgba(0,0,0,0.14),0px 6px 30px 5px rgba(0,0,0,0.12)',
    '0px 8px 11px -5px rgba(0,0,0,0.2),0px 17px 26px 2px rgba(0,0,0,0.14),0px 6px 32px 5px rgba(0,0,0,0.12)',
    '0px 9px 11px -5px rgba(0,0,0,0.2),0px 18px 28px 2px rgba(0,0,0,0.14),0px 7px 34px 6px rgba(0,0,0,0.12)',
    '0px 9px 12px -6px rgba(0,0,0,0.2),0px 19px 29px 2px rgba(0,0,0,0.14),0px 7px 36px 6px rgba(0,0,0,0.12)',
    '0px 10px 13px -6px rgba(0,0,0,0.2),0px 20px 31px 3px rgba(0,0,0,0.14),0px 8px 38px 7px rgba(0,0,0,0.12)',
    '0px 10px 13px -6px rgba(0,0,0,0.2),0px 21px 33px 3px rgba(0,0,0,0.14),0px 8px 40px 7px rgba(0,0,0,0.12)',
    '0px 10px 14px -6px rgba(0,0,0,0.2),0px 22px 35px 3px rgba(0,0,0,0.14),0px 8px 42px 7px rgba(0,0,0,0.12)',
    '0px 11px 14px -7px rgba(0,0,0,0.2),0px 23px 36px 3px rgba(0,0,0,0.14),0px 9px 44px 8px rgba(0,0,0,0.12)',
    '0px 11px 15px -7px rgba(0,0,0,0.2),0px 24px 38px 3px rgba(0,0,0,0.14),0px 9px 46px 8px rgba(0,0,0,0.12)'
]

const theme = createTheme({
    palette,
    typography,
    shadows: shadows as any,
    shape: {
        borderRadius: 8
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none'
                    }
                },
                containedInherit: {
                    color: palette.grey[800],
                    backgroundColor: palette.grey[300],
                    '&:hover': {
                        backgroundColor: palette.grey[400]
                    }
                },
                containedPrimary: {
                    boxShadow: '0 8px 16px 0 rgba(0, 171, 85, 0.24)'
                }
            }
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)',
                    borderRadius: 16,
                    position: 'relative',
                    zIndex: 0 // Fix stacking context
                }
            }
        },
        MuiCardContent: {
            styleOverrides: {
                root: {
                    padding: 24
                }
            }
        },
        MuiCardHeader: {
            styleOverrides: {
                root: {
                    padding: '24px 24px 0'
                }
            }
        },
        MuiPaper: {
            defaultProps: {
                elevation: 0
            }
        },
        MuiTableCell: {
            styleOverrides: {
                head: {
                    color: palette.text.secondary,
                    backgroundColor: palette.background.default
                }
            }
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    backgroundColor: palette.grey[800]
                },
                arrow: {
                    color: palette.grey[800]
                }
            }
        }
    }
})

export default theme
