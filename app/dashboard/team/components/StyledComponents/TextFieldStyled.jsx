import { styled } from '@mui/material/styles';
import { TextField } from '@mui/material';

const TextFieldStyled = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    backgroundColor: '#34495e',
    borderRadius: '10px',
    color: '#ecf0f1'
  },
  '& .MuiInputLabel-root': {
    color: '#ecf0f1'
  }
}));

export default TextFieldStyled;
