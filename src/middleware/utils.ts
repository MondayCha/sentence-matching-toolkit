import moment from 'moment';

// moment().format('YYYY-MM-DD HH:mm:ss')
export const getTimestamp = () => moment().format('YYYY.MM.DD_HH.mm.ss');
