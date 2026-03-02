import { useQuery } from '@tanstack/react-query'
import getAreaIdForLatLong from 'api/avalanche/getAreaIdForLatLong'
import { retryQuery } from 'api/utils/RetryQuery'
import { OneHourInMilliseconds } from 'consts/numberConsts'

const useGetAvalancheAreaId = (latitude: number, longitude: number, enabled: boolean) => {
  const areaIdQueryResult = useQuery({
    queryKey: ['avalanche-areaId', latitude, longitude],
    queryFn: () => getAreaIdForLatLong(latitude, longitude),
    staleTime: OneHourInMilliseconds,
    retry: retryQuery,
    throwOnError: false,
    enabled: enabled
  })

  return areaIdQueryResult
}

export default useGetAvalancheAreaId
