'use client';
import { useState, useEffect } from 'react';
import styles from './Notification.module.css';

export default function Notification({ 
  message, 
  type = 'success', 
  duration = 3000,
  onClose 
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`${styles.notification} ${styles[type]}`}>
      {message}
    </div>
  );
}