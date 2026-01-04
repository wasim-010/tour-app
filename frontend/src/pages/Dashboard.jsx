// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Text, SimpleGrid, Spinner, Alert, AlertIcon,
  LinkBox, LinkOverlay, Button, Flex, Spacer, HStack, useDisclosure, IconButton,
  useToast
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import EditGroupModal from '../components/admin/EditGroupModal';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';

const Dashboard = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [selectedGroup, setSelectedGroup] = useState(null);

  const fetchGroups = async () => {
    // No setLoading(true) here because the initial loading state handles the first load.
    // This makes subsequent refreshes (after edits/deletes) smoother.
    try {
      const response = await api.get('/groups');
      const userGroups = response.data;
      setGroups(userGroups);

      // Auto-navigate logic for single-group non-admin users
      if (user && user.role !== 'admin' && userGroups && userGroups.length === 1) {
        navigate(`/group/${userGroups[0].group_id}/itinerary`, { replace: true });
      }
    } catch (err) {
      setError('Failed to fetch tour groups. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only run fetch on initial mount or if the user object changes (e.g., on login)
    if (user) {
      fetchGroups();
    }
  }, [user]);

  // These handlers need to stop event propagation to prevent navigating
  // when the user is trying to click a button inside the LinkBox.
  const handleEditClick = (e, group) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedGroup(group);
    onEditOpen();
  };

  const handleDeleteClick = (e, group) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedGroup(group);
    onDeleteOpen();
  };

  const confirmDelete = async () => {
    if (!selectedGroup) return;
    try {
      await api.delete(`/groups/${selectedGroup.group_id}`);
      toast({ title: 'Group Deleted', status: 'success', isClosable: true });
      fetchGroups(); // Refresh the list after deletion
    } catch (error) {
      toast({ title: 'Delete Failed', status: 'error', isClosable: true });
    } finally {
      onDeleteClose();
      setSelectedGroup(null);
    }
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" my={8}><Spinner size="xl" /></Box>;
  }

  if (error) return <Alert status="error"><AlertIcon />{error}</Alert>;

  return (
    <>
      <Box>
        <Flex align="center" mb={6}>
          <Heading as="h1" size="xl">My Tour Groups</Heading>
          <Spacer />
          {user && user.role === 'admin' && (
            <Button as={RouterLink} to="/groups/new" colorScheme="brand">
              Create New Group
            </Button>
          )}
        </Flex>

        {groups.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {groups.map((group) => {
              const isGroupAdmin = group.role === 'admin';
              // The destination of the main link depends on the user's role in the group
              const destination = isGroupAdmin
                ? `/admin/group/${group.group_id}`
                : `/group/${group.group_id}/itinerary`;

              return (
                <LinkBox
                  as="div"
                  key={group.group_id}
                  p={5}
                  shadow="md"
                  borderWidth="1px"
                  borderRadius="lg"
                  display="flex"
                  flexDirection="column"
                  _hover={{ shadow: 'lg', transform: 'translateY(-2px)', transition: '0.2s', cursor: 'pointer' }}
                >
                  <Box flex="1">
                    <Heading fontSize="xl" my={2}>
                      <LinkOverlay as={RouterLink} to={destination}>
                        {group.group_name}
                      </LinkOverlay>
                    </Heading>
                    <Text mb={4}>{group.description || 'No description available.'}</Text>
                  </Box>
                  <Flex alignItems="center">
                    <Text fontSize="sm" color="gray.500">Your role: {group.role}</Text>
                    <Spacer />
                    {isGroupAdmin && (
                      <HStack>
                        <IconButton icon={<EditIcon />} size="sm" colorScheme="blue" aria-label="Edit group" onClick={(e) => handleEditClick(e, group)} />
                        <IconButton icon={<DeleteIcon />} size="sm" colorScheme="red" aria-label="Delete group" onClick={(e) => handleDeleteClick(e, group)} />
                      </HStack>
                    )}
                  </Flex>
                </LinkBox>
              );
            })}
          </SimpleGrid>
        ) : (
          <Text>
            {user && user.role === 'admin'
              ? "You are not a member of any tour groups yet. Create one to get started!"
              : "You have not been added to any tour groups yet."
            }
          </Text>
        )}
      </Box>
      <EditGroupModal isOpen={isEditOpen} onClose={onEditClose} group={selectedGroup} onUpdate={fetchGroups} />
      <DeleteConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={confirmDelete}
        title="Delete Group"
        body="Are you sure? This will permanently delete the group and all its data, including days, locations, events, and expenses."
      />
    </>
  );
};

export default Dashboard;