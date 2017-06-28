/* eslint-disable import/prefer-default-export */
import select from 'select-dom';

export const getUsername = () => select('meta[name="user-login"]').getAttribute('content');
