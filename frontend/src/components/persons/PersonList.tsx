import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Avatar,
  Typography,
  Box
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface Person {
  id: number;
  name: string;
  biography?: string;
  birth_date?: string;
  death_date?: string;
  avatar_url?: string;
}

interface PersonListProps {
  persons: Person[];
}

export const PersonList: React.FC<PersonListProps> = ({ persons }) => {
  const navigate = useNavigate();

  return (
    <Grid container spacing={2}>
      {persons.map((person) => (
        <Grid item xs={12} sm={6} md={4} key={person.id}>
          <Card
            sx={{ cursor: 'pointer' }}
            onClick={() => navigate(`/persons/${person.id}`)}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Avatar
                  src={person.avatar_url}
                  alt={person.name}
                  sx={{ width: 56, height: 56 }}
                />
                <Box>
                  <Typography variant="h6">{person.name}</Typography>
                  {person.birth_date && (
                    <Typography variant="body2" color="text.secondary">
                      {new Date(person.birth_date).toLocaleDateString()}
                      {person.death_date && 
                        ` - ${new Date(person.death_date).toLocaleDateString()}`
                      }
                    </Typography>
                  )}
                </Box>
              </Box>
              {person.biography && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {person.biography}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};
