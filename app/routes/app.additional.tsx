import { authenticate } from "../shopify.server";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import {
  Page,
  Card,
  InlineGrid,
  BlockStack,
  Text,
  IndexTable,
  useIndexResourceState,
  Button,
  Popover,
  DatePicker,
  TextField,
  InlineStack,
  OptionList,
  Box,
  Scrollable,
  Icon,
} from "@shopify/polaris";
import { CalendarIcon, ArrowRightIcon } from "@shopify/polaris-icons";
import prisma from "../db.server";
import { useLoaderData, useSearchParams, useFetcher } from "react-router";
import { useState, useEffect } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const authResult = await authenticate.admin(request);
  const { session } = authResult;
  const shop = session.shop;

  // Get date range from URL params
  const url = new URL(request.url);
  const sinceParam = url.searchParams.get('since');
  const untilParam = url.searchParams.get('until');
  
  // Build date filter
  const dateFilter: any = {};
  if (sinceParam || untilParam) {
    dateFilter.claimedAt = {};
    if (sinceParam) {
      const since = new Date(sinceParam);
      since.setHours(0, 0, 0, 0);
      dateFilter.claimedAt.gte = since;
    }
    if (untilParam) {
      const until = new Date(untilParam);
      until.setHours(23, 59, 59, 999);
      dateFilter.claimedAt.lte = until;
    }
  }

  const popupViewDateFilter: any = {};
  if (sinceParam || untilParam) {
    popupViewDateFilter.viewedAt = {};
    if (sinceParam) {
      const since = new Date(sinceParam);
      since.setHours(0, 0, 0, 0);
      popupViewDateFilter.viewedAt.gte = since;
    }
    if (untilParam) {
      const until = new Date(untilParam);
      until.setHours(23, 59, 59, 999);
      popupViewDateFilter.viewedAt.lte = until;
    }
  }

  const gamePlayDateFilter: any = {};
  if (sinceParam || untilParam) {
    gamePlayDateFilter.playedAt = {};
    if (sinceParam) {
      const since = new Date(sinceParam);
      since.setHours(0, 0, 0, 0);
      gamePlayDateFilter.playedAt.gte = since;
    }
    if (untilParam) {
      const until = new Date(untilParam);
      until.setHours(23, 59, 59, 999);
      gamePlayDateFilter.playedAt.lte = until;
    }
  }

  // Fetch all data in parallel with date filtering
  const [claims, popupViews, gamePlays] = await Promise.all([
    prisma.discountClaim.findMany({
      where: { 
        shop,
        ...dateFilter,
      },
      orderBy: { claimedAt: 'desc' },
    }),
    prisma.popupView.findMany({
      where: { 
        shop,
        ...popupViewDateFilter,
      },
    }),
    prisma.gamePlay.findMany({
      where: { 
        shop,
        ...gamePlayDateFilter,
      },
    }),
  ]);

  // Calculate metrics
  const popupViewsCount = popupViews.length;
  const gamesPlayedCount = gamePlays.length;
  const subscribers = claims.length;
  
  const averageDiscountWin = claims.length > 0
    ? claims.reduce((sum, claim) => sum + claim.percentage, 0) / claims.length
    : 0;

  const conversionRate = popupViewsCount > 0
    ? (subscribers / popupViewsCount) * 100
    : 0;

  // Map game type to display name
  const gameTypeMap: Record<string, string> = {
    "bouncing-ball": "Spike Dodge",
    "horizontal-lines": "Pass the Gaps",
    "reaction-click": "Reaction Click",
  };

  return {
    stats: {
      popupViews: popupViewsCount,
      gamesPlayed: gamesPlayedCount,
      averageDiscountWin: Math.round(averageDiscountWin * 10) / 10,
      subscribers,
      conversionRate: Math.round(conversionRate * 10) / 10,
    },
    claims: claims.map(claim => ({
      id: claim.id,
      email: claim.email || '-',
      name: claim.firstName && claim.lastName 
        ? `${claim.firstName} ${claim.lastName}` 
        : claim.firstName || claim.lastName || '-',
      discountWon: `${claim.percentage}%`,
      gameType: claim.gameType ? (gameTypeMap[claim.gameType] || claim.gameType) : '-',
      discountCode: claim.discountCode,
      device: claim.device || '-',
      difficulty: claim.difficulty || '-',
    })),
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const authResult = await authenticate.admin(request);
  const { session } = authResult;
  const shop = session.shop;

  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    const ids = formData.getAll("ids") as string[];
    
    if (!ids || ids.length === 0) {
      return Response.json({ error: "No IDs provided" }, { status: 400 });
    }

    try {
      // Delete discount claims
      await prisma.discountClaim.deleteMany({
        where: {
          id: { in: ids },
          shop: shop, // Ensure we only delete claims for this shop
        },
      });

      return Response.json({ success: true, deleted: ids.length });
    } catch (error) {
      console.error("Error deleting subscribers:", error);
      return Response.json(
        { error: "Failed to delete subscribers" },
        { status: 500 }
      );
    }
  }

  return Response.json({ error: "Invalid intent" }, { status: 400 });
};

export default function AdditionalPage() {
  const { stats, claims } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const fetcher = useFetcher();
  
  // Date range state
  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const yesterday = new Date(
    new Date(new Date().setDate(today.getDate() - 1)).setHours(0, 0, 0, 0)
  );
  
  const ranges = [
    {
      title: "Today",
      alias: "today",
      period: {
        since: today,
        until: today,
      },
    },
    {
      title: "Yesterday",
      alias: "yesterday",
      period: {
        since: yesterday,
        until: yesterday,
      },
    },
    {
      title: "Last 7 days",
      alias: "last7days",
      period: {
        since: new Date(
          new Date(new Date().setDate(today.getDate() - 7)).setHours(0, 0, 0, 0)
        ),
        until: yesterday,
      },
    },
    {
      title: "Last 30 days",
      alias: "last30days",
      period: {
        since: new Date(
          new Date(new Date().setDate(today.getDate() - 30)).setHours(0, 0, 0, 0)
        ),
        until: yesterday,
      },
    },
    {
      title: "Last 90 days",
      alias: "last90days",
      period: {
        since: new Date(
          new Date(new Date().setDate(today.getDate() - 90)).setHours(0, 0, 0, 0)
        ),
        until: yesterday,
      },
    },
    {
      title: "Last 365 days",
      alias: "last365days",
      period: {
        since: new Date(
          new Date(new Date().setDate(today.getDate() - 365)).setHours(0, 0, 0, 0)
        ),
        until: yesterday,
      },
    },
  ];

  // Helper functions
  const VALID_YYYY_MM_DD_DATE_REGEX = /^\d{4}-\d{1,2}-\d{1,2}/;
  
  function isDate(date: any) {
    return !isNaN(new Date(date).getDate());
  }
  
  function isValidYearMonthDayDateString(date: string) {
    return VALID_YYYY_MM_DD_DATE_REGEX.test(date) && isDate(date);
  }
  
  function isValidDate(date: string) {
    return date.length === 10 && isValidYearMonthDayDateString(date);
  }
  
  function parseYearMonthDayDateString(input: string) {
    const [year, month, day] = input.split("-");
    return new Date(Number(year), Number(month) - 1, Number(day));
  }
  
  function formatDateToYearMonthDayDateString(date: Date) {
    const year = String(date.getFullYear());
    let month = String(date.getMonth() + 1);
    let day = String(date.getDate());
    if (month.length < 2) {
      month = String(month).padStart(2, "0");
    }
    if (day.length < 2) {
      day = String(day).padStart(2, "0");
    }
    return [year, month, day].join("-");
  }
  
  function formatDate(date: Date) {
    return formatDateToYearMonthDayDateString(date);
  }

  // Initialize active date range from URL params or default to "Last 7 days"
  const getInitialDateRange = () => {
    const sinceParam = searchParams.get('since');
    const untilParam = searchParams.get('until');
    
    if (sinceParam && untilParam) {
      const since = new Date(sinceParam);
      const until = new Date(untilParam);
      return {
        alias: "custom",
        title: "Custom",
        period: { since, until },
      };
    }
    return ranges[2]; // Default to "Last 7 days"
  };

  const [popoverActive, setPopoverActive] = useState(false);
  const [activeDateRange, setActiveDateRange] = useState(getInitialDateRange());
  const [inputValues, setInputValues] = useState({
    since: formatDate(activeDateRange.period.since),
    until: formatDate(activeDateRange.period.until),
  });
  const [{ month, year }, setDate] = useState({
    month: activeDateRange.period.since.getMonth(),
    year: activeDateRange.period.since.getFullYear(),
  });

  // Event handlers
  function handleStartInputValueChange(value: string) {
    setInputValues((prevState) => ({ ...prevState, since: value }));
    if (isValidDate(value)) {
      const newSince = parseYearMonthDayDateString(value);
      setActiveDateRange((prevState) => {
        const newPeriod =
          prevState.period && newSince <= prevState.period.until
            ? { since: newSince, until: prevState.period.until }
            : { since: newSince, until: newSince };
        return {
          ...prevState,
          period: newPeriod,
        };
      });
    }
  }

  function handleEndInputValueChange(value: string) {
    setInputValues((prevState) => ({ ...prevState, until: value }));
    if (isValidDate(value)) {
      const newUntil = parseYearMonthDayDateString(value);
      setActiveDateRange((prevState) => {
        const newPeriod =
          prevState.period && newUntil >= prevState.period.since
            ? { since: prevState.period.since, until: newUntil }
            : { since: newUntil, until: newUntil };
        return {
          ...prevState,
          period: newPeriod,
        };
      });
    }
  }

  function handleCalendarChange({ start, end }: { start: Date; end: Date }) {
    const newDateRange = ranges.find((range) => {
      return (
        range.period.since.valueOf() === start.valueOf() &&
        range.period.until.valueOf() === end.valueOf()
      );
    }) || {
      alias: "custom",
      title: "Custom",
      period: {
        since: start,
        until: end,
      },
    };
    setActiveDateRange(newDateRange);
  }

  function apply() {
    // Update URL params and reload
    const params = new URLSearchParams();
    params.set('since', formatDate(activeDateRange.period.since));
    params.set('until', formatDate(activeDateRange.period.until));
    setSearchParams(params);
    setPopoverActive(false);
  }

  function cancel() {
    setPopoverActive(false);
  }

  // Update input values when date range changes
  useEffect(() => {
    if (activeDateRange) {
      setInputValues({
        since: formatDate(activeDateRange.period.since),
        until: formatDate(activeDateRange.period.until),
      });
      const monthDifference = 
        (activeDateRange.period.until.getFullYear() - year) * 12 +
        (activeDateRange.period.until.getMonth() - month);
      if (monthDifference > 1 || monthDifference < 0) {
        setDate({
          month: activeDateRange.period.until.getMonth(),
          year: activeDateRange.period.until.getFullYear(),
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDateRange]);

  const buttonValue =
    activeDateRange.title === "Custom"
      ? activeDateRange.period.since.toDateString() +
        " - " +
        activeDateRange.period.until.toDateString()
      : activeDateRange.title;

  const resourceName = {
    singular: "result",
    plural: "results",
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(claims);

  // Handle delete
  const handleDelete = () => {
    if (selectedResources.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedResources.length} subscriber(s)? This action cannot be undone.`)) {
      const formData = new FormData();
      formData.append("intent", "delete");
      selectedResources.forEach((id) => {
        formData.append("ids", id);
      });
      
      fetcher.submit(formData, { method: "POST" });
    }
  };

  // Refresh page after successful deletion
  useEffect(() => {
    if (fetcher.data?.success) {
      window.location.reload();
    }
  }, [fetcher.data]);

  const rowMarkup = claims.map(
    ({ id, email, name, discountWon, gameType, discountCode, device, difficulty }, index) => (
      <IndexTable.Row
        id={id}
        key={id}
        selected={selectedResources.includes(id)}
        position={index}
      >
        <IndexTable.Cell>
          <Text variant="bodyMd" as="span">
            {email}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>{name}</IndexTable.Cell>
        <IndexTable.Cell>
          <Text as="span" alignment="end" numeric>
            {discountWon}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>{gameType}</IndexTable.Cell>
        <IndexTable.Cell>{difficulty}</IndexTable.Cell>
        <IndexTable.Cell>{device}</IndexTable.Cell>
        <IndexTable.Cell>{discountCode}</IndexTable.Cell>
      </IndexTable.Row>
    ),
  );

  return (
    <Page title="Analytics" fullWidth>
      <BlockStack gap="500">
        {/* Date Range Picker */}
        <InlineStack align="start">
          <Popover
            active={popoverActive}
            autofocusTarget="none"
            preferredAlignment="left"
            preferredPosition="below"
            fluidContent
            sectioned={false}
            fullHeight
            activator={
              <Button
                size="slim"
                icon={CalendarIcon}
                onClick={() => setPopoverActive(!popoverActive)}
              >
                {buttonValue}
              </Button>
            }
            onClose={() => setPopoverActive(false)}
          >
            <Popover.Pane fixed>
              <InlineGrid
                columns={{
                  xs: "1fr",
                  md: "max-content max-content",
                }}
                gap={0}
              >
                <Box
                  maxWidth="212px"
                  width="212px"
                  padding={{ xs: 500, md: 0 }}
                  paddingBlockEnd={{ xs: 100, md: 0 }}
                >
                  <Scrollable style={{ height: "334px" }}>
                    <OptionList
                      options={ranges.map((range) => ({
                        value: range.alias,
                        label: range.title,
                      }))}
                      selected={activeDateRange.alias}
                      onChange={(value) => {
                        setActiveDateRange(
                          ranges.find((range) => range.alias === value[0]) || ranges[2]
                        );
                      }}
                    />
                  </Scrollable>
                </Box>
                <Box padding={{ xs: 500 }} maxWidth="516px">
                  <BlockStack gap="400">
                    <InlineStack gap="200">
                      <div style={{ flexGrow: 1 }}>
                        <TextField
                          role="combobox"
                          label="Since"
                          labelHidden
                          prefix={<Icon source={CalendarIcon} />}
                          value={inputValues.since}
                          onChange={handleStartInputValueChange}
                          autoComplete="off"
                        />
                      </div>
                      <Icon source={ArrowRightIcon} />
                      <div style={{ flexGrow: 1 }}>
                        <TextField
                          role="combobox"
                          label="Until"
                          labelHidden
                          prefix={<Icon source={CalendarIcon} />}
                          value={inputValues.until}
                          onChange={handleEndInputValueChange}
                          autoComplete="off"
                        />
                      </div>
                    </InlineStack>
                    <div>
                      <DatePicker
                        month={month}
                        year={year}
                        selected={{
                          start: activeDateRange.period.since,
                          end: activeDateRange.period.until,
                        }}
                        onMonthChange={(month, year) => setDate({ month, year })}
                        onChange={handleCalendarChange}
                        multiMonth={true}
                        allowRange
                      />
                    </div>
                  </BlockStack>
                </Box>
              </InlineGrid>
            </Popover.Pane>
            <Popover.Pane fixed>
              <Popover.Section>
                <InlineStack align="end" gap="200">
                  <Button onClick={cancel}>Cancel</Button>
                  <Button variant="primary" onClick={apply}>
                    Apply
                  </Button>
                </InlineStack>
              </Popover.Section>
            </Popover.Pane>
          </Popover>
        </InlineStack>

        <InlineGrid columns={{ xs: 1, sm: 2, md: 3, lg: 5 }} gap="400">
          <Card>
            <BlockStack gap="200">
              <Text variant="headingSm" as="h2">
                Popup Views
              </Text>
              <Text variant="headingLg" as="p">
                {stats.popupViews.toLocaleString()}
              </Text>
            </BlockStack>
          </Card>
          <Card>
            <BlockStack gap="200">
              <Text variant="headingSm" as="h2">
                Games Played
              </Text>
              <Text variant="headingLg" as="p">
                {stats.gamesPlayed.toLocaleString()}
              </Text>
            </BlockStack>
          </Card>
          <Card>
            <BlockStack gap="200">
              <Text variant="headingSm" as="h2">
                Average Discount Win
              </Text>
              <Text variant="headingLg" as="p">
                {stats.averageDiscountWin}%
              </Text>
            </BlockStack>
          </Card>
          <Card>
            <BlockStack gap="200">
              <Text variant="headingSm" as="h2">
                Subscribers
              </Text>
              <Text variant="headingLg" as="p">
                {stats.subscribers.toLocaleString()}
              </Text>
            </BlockStack>
          </Card>
          <Card>
            <BlockStack gap="200">
              <Text variant="headingSm" as="h2">
                Conversion Rate
              </Text>
              <Text variant="headingLg" as="p">
                {stats.conversionRate}%
              </Text>
            </BlockStack>
          </Card>
        </InlineGrid>

        <Card padding="0">
          <IndexTable
            resourceName={resourceName}
            itemCount={claims.length}
            selectedItemsCount={
              allResourcesSelected ? "All" : selectedResources.length
            }
            onSelectionChange={handleSelectionChange}
            bulkActions={
              selectedResources.length > 0
                ? [
                    {
                      content: "Delete subscribers",
                      onAction: handleDelete,
                    },
                  ]
                : undefined
            }
            headings={[
              { title: "Email" },
              { title: "Name" },
              { title: "Discount Won", alignment: "end" },
              { title: "Game" },
              { title: "Difficulty" },
              { title: "Device" },
              { title: "Discount Code" },
            ]}
          >
            {rowMarkup}
          </IndexTable>
        </Card>
      </BlockStack>
    </Page>
  );
}
