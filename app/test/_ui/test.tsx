'use client';

import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Image from 'next/image';
import React from 'react';

import styles from './test.module.css';

/**
 * Test
 * @returns
 */
const Test = () => {
  /* jsx
  ---------------------------------------------------------------------------------------------------- */
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image src="/next.svg" alt="Next.js logo" width={180} height={38} priority />
        <Typography variant="h1">みんなの社食</Typography>
        <ol>
          <Typography variant="body1">
            <li>みんなの社食</li>
          </Typography>
          <Typography variant="body1">
            <li>
              Get started by editing <code>app/page.tsx</code>.
            </li>
          </Typography>
          <Typography variant="body1">
            <li>Save and see your changes instantly.</li>
          </Typography>
        </ol>
        <Button variant="contained">みんなの社食</Button>
      </main>
    </div>
  );
};
export default Test;
