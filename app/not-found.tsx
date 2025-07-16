import { Box, Button, Divider, Grid2 as Grid, Paper, Typography } from '@mui/material';
import { redirect } from 'next/navigation';

export default async function NotFound() {
  return (
    <Paper
      sx={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Grid container alignItems="center">
        <Typography component="h2" variant="h6" color="primary" gutterBottom sx={{ px: 3, py: 2, mb: 0 }}>
          404 Not Found
        </Typography>
      </Grid>
      <Divider />
      <Box sx={{ m: 3 }}>
        <Typography>このURLに該当するページは存在しません。 下のボタンから再度アクセスしてください。</Typography>
        <Button variant="contained" onClick={redirect('/schedule')} sx={{ display: 'flex', mb: 1.5, width: 240 }}>
          <Typography variant="button">ログインする</Typography>
        </Button>
      </Box>
    </Paper>
  );
}
