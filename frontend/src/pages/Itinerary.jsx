// src/pages/Itinerary.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Heading, Text, Spinner, Alert, AlertIcon, Tabs, TabList, TabPanels, Tab, TabPanel,
  VStack, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
  Badge, Flex, Spacer, Button, useDisclosure, Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalCloseButton, ModalBody, HStack
} from '@chakra-ui/react';
import { TimeIcon } from '@chakra-ui/icons';
import api from '../api/api';
import AddExpenseModal from '../components/AddExpenseModal';
import { useAuth } from '../context/AuthContext';
import MapView from '../components/MapView';

// Helper function to format time
const formatTime = (timeString) => {
  if (!timeString) return '';
  try {
    const [hourString, minute] = timeString.split(':');
    const hour = +hourString % 24;
    return new Date(1970, 0, 1, hour, minute).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  } catch (e) {
    return '';
  }
};

const Itinerary = () => {
  const { groupId } = useParams();
  const { user } = useAuth();
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [groupName, setGroupName] = useState('Tour Itinerary');
  const [userRole, setUserRole] = useState('member');
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  const { isOpen: isExpenseOpen, onOpen: onExpenseOpen, onClose: onExpenseClose } = useDisclosure();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { isOpen: isMapOpen, onOpen: onMapOpen, onClose: onMapClose } = useDisclosure();

  useEffect(() => {
    const fetchData = async () => {
      if (!groupId || !user) return;
      setLoading(true);
      try {
        const [itineraryRes, groupsRes] = await Promise.all([
          api.get(`/tours/${groupId}`),
          api.get('/groups'),
        ]);

        setItinerary(itineraryRes.data);

        const currentGroup = groupsRes.data.find(g => g.group_id.toString() === groupId);
        if (currentGroup) {
          setGroupName(currentGroup.group_name);
          setUserRole(currentGroup.role);
        }
      } catch (err) {
        setError('Failed to fetch itinerary data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [groupId, user]);

  const handleAddExpenseClick = (event) => {
    setSelectedEvent(event);
    onExpenseOpen();
  };

  const activeDayPins = useMemo(() => {
    if (!itinerary || !itinerary.days[activeDayIndex]) return [];
    const activeDay = itinerary.days[activeDayIndex];
    return (activeDay?.locations || [])
      .filter(loc => loc.latitude != null && loc.longitude != null)
      .map(loc => ({
        id: loc.location_id,
        name: (loc.events && loc.events.length > 0) ? loc.events[0].event_name : loc.location_name,
        latitude: loc.latitude,
        longitude: loc.longitude,
        order_in_day: loc.order_in_day,
        location_name: loc.location_name
      }));
  }, [itinerary, activeDayIndex]);

  if (loading) return <Spinner size="xl" display="block" mx="auto" my={8} />;
  if (error) return <Alert status="error"><AlertIcon />{error}</Alert>;

  if (!itinerary || !itinerary.days || !itinerary.days.length) {
    return (
      <Box>
        <Heading mb={6}>{groupName}</Heading>
        <Text>No itinerary has been set for this group yet.</Text>
      </Box>
    );
  }

  const activeDay = itinerary.days[activeDayIndex];

  return (
    <>
      <Box>
        <Heading mb={6}>{groupName}</Heading>
        <Tabs isFitted variant="enclosed-colored" onChange={(index) => setActiveDayIndex(index)}>
          <TabList>
            {itinerary.days.map(day => <Tab key={day.day_id}>{`Day ${day.day_number}: ${day.title}`}</Tab>)}
          </TabList>
          <TabPanels>
            {itinerary.days.map((day, index) => (
              <TabPanel key={day.day_id}>
                <Flex mb={4} align="center" wrap="wrap">
                  <Text fontSize="lg" fontWeight="bold">{new Date(day.day_date).toDateString()}</Text>
                  <Spacer />
                  <Badge colorScheme={day.status === 'Ongoing' ? 'green' : day.status === 'Ended' ? 'red' : 'gray'}>{day.status}</Badge>
                </Flex>

                {day.description && (
                  <Text fontStyle="italic" color="gray.700" mb={6} p={4} bg="gray.100" borderRadius="md">
                    {day.description}
                  </Text>
                )}

                {activeDayIndex === index && (
                  <Box height="250px" mb={6} position="relative" borderRadius="md" overflow="hidden" bg="gray.200">
                    <MapView pins={activeDayPins} />
                    <Button size="sm" colorScheme="blue" position="absolute" top="10px" right="10px" zIndex={1} onClick={onMapOpen}>
                      Enlarge Map
                    </Button>
                  </Box>
                )}

                <Accordion allowToggle defaultIndex={[0]}>
                  {(day.locations || []).map(location => (
                    <AccordionItem key={location.location_id}>
                      <h2>
                        <AccordionButton>
                          <Box flex="1" textAlign="left" fontWeight="bold">
                            {location.order_in_day}. {location.location_name}
                          </Box>
                          {(location.start_time || location.end_time) && (
                            <HStack spacing={2} color="gray.500" mr={4}>
                              <TimeIcon />
                              <Text fontSize="sm" fontWeight="medium">
                                {formatTime(location.start_time)}
                                {location.end_time && ` - ${formatTime(location.end_time)}`}
                              </Text>
                            </HStack>
                          )}
                          <AccordionIcon />
                        </AccordionButton>
                      </h2>
                      <AccordionPanel pb={4}>
                        <VStack align="stretch" spacing={3}>
                          {(location.events || []).map(event => (
                            <Box key={event.event_id} p={4} borderWidth="1px" borderRadius="lg" shadow="sm">
                              <Heading size="md">{event.event_name}</Heading>
                              {event.description && <Text fontSize="sm" color="gray.600" mt={1}>{event.description}</Text>}
                              <Flex align="center" justify="space-between" mt={4}>
                                <HStack spacing={1} color="gray.500" minW="80px">
                                  {event.event_time && <TimeIcon />}
                                  {event.event_time && <Text fontSize="sm" fontWeight="medium">{formatTime(event.event_time)}</Text>}
                                </HStack>
                                <VStack spacing={0}>
                                  <Text fontWeight="bold" fontSize="lg" color="blue.600">৳{event.estimated_cost_per_unit.toFixed(2)}</Text>
                                  <Text fontSize="xs" color="gray.500">per unit</Text>
                                </VStack>
                                {userRole !== 'admin' && (
                                  <Button
                                    colorScheme="brand"
                                    size="sm"
                                    onClick={() => handleAddExpenseClick(event)}
                                    isDisabled={day.status !== 'Ongoing'}
                                    w="70px"
                                  >
                                    Add
                                  </Button>
                                )}
                              </Flex>
                            </Box>
                          ))}
                          {location.events.length === 0 && <Text fontSize="sm" color="gray.500">No events for this location.</Text>}
                        </VStack>
                      </AccordionPanel>
                    </AccordionItem>
                  ))}
                  {(day.locations || []).length === 0 && <Text mt={4} color="gray.500">No locations for this day.</Text>}
                </Accordion>
              </TabPanel>
            )
            )}
          </TabPanels>
        </Tabs>
      </Box>

      <AddExpenseModal isOpen={isExpenseOpen} onClose={onExpenseClose} event={selectedEvent} />

      <Modal isOpen={isMapOpen} onClose={onMapClose} size="full">
        <ModalContent display="flex" flexDirection="column" h="100vh">
          <ModalHeader>Day {activeDay?.day_number}: {activeDay?.title}</ModalHeader>
          <ModalCloseButton zIndex={1000} bg="whiteAlpha.700" borderRadius="full" />
          <ModalBody p={0} flex="1">
            {isMapOpen && <MapView pins={activeDayPins} />}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Itinerary;