-- Give the 4 original seed artworks real photos, matching the images already
-- used for these same pieces on the dedicated Marketplace page.
update public.artworks set image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/500px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg' where id = 'art-1';
update public.artworks set image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg/500px-The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg' where id = 'art-2';
update public.artworks set image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Edvard_Munch_-_The_Scream.jpg/500px-Edvard_Munch_-_The_Scream.jpg' where id = 'art-3';
update public.artworks set image_url = 'https://images.unsplash.com/photo-1552083375-1447ce886485?w=600&h=600&fit=crop&auto=format&q=80' where id = 'art-4';
