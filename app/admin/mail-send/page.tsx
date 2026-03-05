import React from 'react';
import MailSendClient from './MailSendClient';

export const metadata = {
    title: 'Email Marketing - Admin Panel',
    description: 'Send broadcast emails to your users.',
};

const MailSendPage = () => {
    return <MailSendClient />;
};

export default MailSendPage;
