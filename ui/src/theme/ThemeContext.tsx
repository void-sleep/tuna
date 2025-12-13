import * as React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { PaletteMode } from '@mui/material';

// 创建主题上下文
export const ColorModeContext = React.createContext({
    toggleColorMode: () => { },
    mode: 'light' as PaletteMode
});

// 主题配置
const getDesignTokens = (mode: PaletteMode) => ({
    palette: {
        mode,
        ...(mode === 'light'
            ? {
                // 亮色模式使用默认配置
            }
            : {
                // 深色模式自定义配置
                primary: {
                    main: '#81d4fa',
                    light: '#b6ffff',
                    dark: '#4ba3c7',
                },
                secondary: {
                    main: '#b39ddb',
                    light: '#e6ceff',
                    dark: '#836fa9',
                },
                background: {
                    default: '#0A1929',
                    paper: '#132f4c',
                },
                text: {
                    primary: '#F3F6F9',
                    secondary: 'rgba(243, 246, 249, 0.7)',
                },
            }),
    },
    shape: {
        borderRadius: 8
    }
});

export function ThemeContextProvider({ children }: { children: React.ReactNode }) {
    const [mode, setMode] = React.useState<PaletteMode>(() => {
        const savedMode = localStorage.getItem('themeMode');
        return (savedMode as PaletteMode) || 'light';
    });

    const colorMode = React.useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode) => {
                    const newMode = prevMode === 'light' ? 'dark' : 'light';
                    localStorage.setItem('themeMode', newMode);
                    return newMode;
                });
            },
            mode,
        }),
        [mode]
    );

    const theme = React.useMemo(
        () => createTheme(getDesignTokens(mode)),
        [mode]
    );

    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                <CssBaseline enableColorScheme />
                {children}
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
}

// 自定义Hook用于访问主题上下文
export const useColorMode = () => React.useContext(ColorModeContext);