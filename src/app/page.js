'use client';
import { useState, useEffect } from 'react';
import { Box, Stack, Typography, Button, Modal, TextField, Alert, Container, Grid, Paper } from '@mui/material';
import { firestore } from './firebase'; // Import firestore from your firebase.js
import { collection, doc, getDocs, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import AddIcon from '@mui/icons-material/Add';
import UpdateIcon from '@mui/icons-material/Update';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    h1: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.875rem',
    },
  },
});

const Home = () => {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentItem, setCurrentItem] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState(null); // State for success/error message

  const updateInventory = async () => {
    try {
      const pantryCollection = collection(firestore, 'pantry');
      const snapshot = await getDocs(pantryCollection);
      const inventoryList = snapshot.docs.map(doc => ({ name: doc.id, ...doc.data() }));
      setInventory(inventoryList);
      setFilteredInventory(inventoryList);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setMessage({ type: 'error', text: 'Error fetching inventory' });
    }
  };

  useEffect(() => {
    updateInventory();
  }, []);

  useEffect(() => {
    // Filter inventory based on search query
    const filtered = inventory.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    setFilteredInventory(filtered);
  }, [searchQuery, inventory]);

  const addItem = async () => {
    if (itemName.trim() === '' || itemQuantity <= 0) {
      setMessage({ type: 'error', text: 'Item name cannot be empty and quantity must be greater than 0' });
      return;
    }
    
    try {
      const docRef = doc(firestore, 'pantry', itemName);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        await setDoc(docRef, { quantity: quantity + itemQuantity }, { merge: true });
      } else {
        await setDoc(docRef, { quantity: itemQuantity });
      }
      setMessage({ type: 'success', text: 'Item added successfully!' });
    } catch (error) {
      console.error('Error adding item:', error);
      setMessage({ type: 'error', text: 'Failed to add item' });
    }
    setItemName('');
    setItemQuantity(0);
    setOpen(false);
    updateInventory();
  };

  const updateItem = async () => {
    if (itemName.trim() === '' || itemQuantity <= 0) {
      setMessage({ type: 'error', text: 'Item name cannot be empty and quantity must be greater than 0' });
      return;
    }
    
    try {
      const docRef = doc(firestore, 'pantry', currentItem);
      await setDoc(docRef, { quantity: itemQuantity }, { merge: true });
      setMessage({ type: 'success', text: 'Item updated successfully!' });
    } catch (error) {
      console.error('Error updating item:', error);
      setMessage({ type: 'error', text: 'Failed to update item' });
    }
    setItemName('');
    setItemQuantity(0);
    setIsUpdating(false);
    setOpen(false);
    updateInventory();
  };

  const removeItem = async (item) => {
    try {
      const docRef = doc(firestore, 'pantry', item);
      await deleteDoc(docRef);
      setMessage({ type: 'success', text: 'Item removed successfully!' });
    } catch (error) {
      console.error('Error removing item:', error);
      setMessage({ type: 'error', text: 'Failed to remove item' });
    }
    updateInventory();
  };

  const openUpdateModal = (item) => {
    setItemName(item.name);
    setItemQuantity(item.quantity);
    setCurrentItem(item.name);
    setIsUpdating(true);
    setOpen(true);
  };

  return (
    <ThemeProvider theme={theme}>
      <Container>
        <Box sx={{ padding: 2 }}>
          <Typography variant="h1" gutterBottom>Pantry Management</Typography>
          {message && (
            <Alert severity={message.type} sx={{ marginBottom: 2 }}>
              {message.text}
            </Alert>
          )}
          <TextField 
            
            fullWidth 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            sx={{ 
              marginBottom: 2,
              backgroundColor: 'white', // Set search bar background to white
            }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ marginRight: 1 }} />,
              style: { color: 'black' } // Set search bar text color to black
            }}
          />
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => { setOpen(true); setIsUpdating(false); }} 
            sx={{ marginBottom: 2 }}
          >
            Add New Item
          </Button>
          <Modal open={open} onClose={() => setOpen(false)}>
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 24,
              p: 4,
            }}>
              <Typography variant="h6">{isUpdating ? 'Update Item' : 'Add Item'}</Typography>
              <TextField 
                label="Item Name" 
                fullWidth 
                value={itemName} 
                onChange={(e) => setItemName(e.target.value)} 
                sx={{ marginBottom: 2 }}
                disabled={isUpdating}
              />
              <TextField 
                label="Quantity" 
                type="number" 
                fullWidth 
                value={itemQuantity} 
                onChange={(e) => setItemQuantity(parseInt(e.target.value) || 0)} 
                sx={{ marginBottom: 2 }}
              />
              <Button 
                variant="contained" 
                onClick={isUpdating ? updateItem : addItem}
              >
                {isUpdating ? 'Update' : 'Add'}
              </Button>
            </Box>
          </Modal>
          <Grid container spacing={2}>
            {filteredInventory.map(({ name, quantity }) => (
              <Grid item xs={12} sm={6} md={4} key={name}>
                <Paper sx={{ padding: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body1" sx={{ color: 'black' }}>{name}</Typography>
                    <Typography variant="body2" sx={{ color: 'black' }}>Quantity: {quantity}</Typography>
                  </Box>
                  <Box>
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      startIcon={<UpdateIcon />} 
                      onClick={() => openUpdateModal({ name, quantity })} 
                      sx={{ marginRight: 1 }}
                    >
                      Update
                    </Button>
                    <Button 
                      variant="contained" 
                      color="error" 
                      startIcon={<DeleteIcon />} 
                      onClick={() => removeItem(name)}
                    >
                      Remove
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default Home;
