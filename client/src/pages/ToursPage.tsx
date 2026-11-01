import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { deleteTour, type Tour, toursQueryOptions } from '../api/tours';
import { TourCards, ToursIntro } from '../components/tours/TourCards';
import { GridPage } from '../shared-components/GridPage';

export default function ToursPage() {
  const queryClient = useQueryClient();

  const { data: tours = [], isLoading } = useQuery(toursQueryOptions);

  const deleteMutation = useMutation({ mutationFn: deleteTour });

  useEffect(() => {
    if (deleteMutation.isSuccess) {
      queryClient.invalidateQueries({ queryKey: toursQueryOptions.queryKey });
    }
  }, [deleteMutation.status]);

  const handleOpen = (editUrl: string) => window.open(editUrl);
  const handleShare = (viewUrl: string) => window.open(viewUrl);
  const handleDelete = (item: Tour) => deleteMutation.mutate(item.h);

  return (
    <GridPage title="My 360° Tours" intro={<ToursIntro />} isLoading={isLoading}>
      <TourCards tours={tours} onOpen={handleOpen} onShare={handleShare} onDelete={handleDelete} />
    </GridPage>
  );
}
