import '@testing-library/jest-dom';
import React from 'react';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

// Mock next/headers
jest.mock('next/headers', () => ({
  cookies: () => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  }),
}));

// Helper to filter out motion props
const filterMotionProps = (props: any) => {
  const { 
    whileHover, 
    whileTap, 
    initial, 
    animate, 
    exit, 
    transition, 
    variants,
    ...rest 
  } = props;
  return rest;
};

// Mock framer-motion as simple elements to avoid SWC/JSX issues in setup
jest.mock('framer-motion', () => ({
  motion: {
    div: (props: any) => React.createElement('div', filterMotionProps(props)),
    button: (props: any) => React.createElement('button', filterMotionProps(props)),
    section: (props: any) => React.createElement('section', filterMotionProps(props)),
    span: (props: any) => React.createElement('span', filterMotionProps(props)),
    h1: (props: any) => React.createElement('h1', filterMotionProps(props)),
    h2: (props: any) => React.createElement('h2', filterMotionProps(props)),
    h3: (props: any) => React.createElement('h3', filterMotionProps(props)),
    p: (props: any) => React.createElement('p', filterMotionProps(props)),
    nav: (props: any) => React.createElement('nav', filterMotionProps(props)),
    header: (props: any) => React.createElement('header', filterMotionProps(props)),
    footer: (props: any) => React.createElement('footer', filterMotionProps(props)),
  },
  AnimatePresence: (props: any) => React.createElement(React.Fragment, {}, props.children),
}));

// Mock lucide-react with simple components
jest.mock('lucide-react', () => {
  const IconMock = (props: any) => React.createElement('svg', props);
  return {
    ArrowRight: IconMock,
    ShoppingBag: IconMock,
    ShieldCheck: IconMock,
    Globe: IconMock,
    Zap: IconMock,
    Menu: IconMock,
    X: IconMock,
    LogIn: IconMock,
    UserPlus: IconMock,
    ArrowLeft: IconMock,
    Eye: IconMock,
    EyeOff: IconMock,
    Home: IconMock,
    User: IconMock,
    Repeat: IconMock,
    Settings: IconMock,
    LogOut: IconMock,
    BookOpen: IconMock,
    ClipboardList: IconMock,
    Activity: IconMock,
    Search: IconMock,
    Filter: IconMock,
    Mail: IconMock,
    Calendar: IconMock,
    ExternalLink: IconMock,
    CheckCircle: IconMock,
    XCircle: IconMock,
    Plus: IconMock,
    TrendingUp: IconMock,
    Package: IconMock,
    Bell: IconMock,
    ShoppingCart: IconMock,
    Tag: IconMock,
    CreditCard: IconMock,
    Clock: IconMock,
    Heart: IconMock,
    Star: IconMock,
    MapPin: IconMock,
    ChevronRight: IconMock,
    ChevronDown: IconMock,
    ChevronUp: IconMock,
    Settings2: IconMock,
    Lock: IconMock,
    Globe2: IconMock,
    BellRing: IconMock,
    Shield: IconMock,
    CheckCircle2: IconMock,
    AlertCircle: IconMock,
    Users: IconMock,
    LayoutDashboard: IconMock,
    IdCard: IconMock,
    Phone: IconMock,
    Send: IconMock,
    HelpCircle: IconMock,
    UserCircle: IconMock,
    Plane: IconMock,
    History: IconMock
  };
});
