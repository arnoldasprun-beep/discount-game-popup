import { authenticate } from "../shopify.server";
import type { LoaderFunctionArgs } from "react-router";
import {
  Page,
  Card,
  InlineGrid,
  BlockStack,
  Text,
  IndexTable,
  useIndexResourceState,
  Tooltip,
} from "@shopify/polaris";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return {};
};

export default function AdditionalPage() {
  // Mock data for visual purposes
  const stats = {
    emailSubscribers: 1247,
    gamesPlayed: 3842,
    averageDiscountWin: 32.5,
    conversionRate: 12.5,
  };

  const mockTableData = [
    {
      id: "1",
      email: "john.doe@example.com",
      name: "John Doe",
      discountWon: "35%",
      device: "Desktop",
      discountCode: "windiscount35123",
    },
    {
      id: "2",
      email: "jane.smith@example.com",
      name: "Jane Smith",
      discountWon: "25%",
      device: "Mobile",
      discountCode: "windiscount25234",
    },
    {
      id: "3",
      email: "bob.johnson@example.com",
      name: "Bob Johnson",
      discountWon: "45%",
      device: "Desktop",
      discountCode: "windiscount45345",
    },
    {
      id: "4",
      email: "alice.williams@example.com",
      name: "Alice Williams",
      discountWon: "20%",
      device: "Mobile",
      discountCode: "windiscount20456",
    },
    {
      id: "5",
      email: "charlie.brown@example.com",
      name: "Charlie Brown",
      discountWon: "50%",
      device: "Desktop",
      discountCode: "windiscount50567",
    },
    {
      id: "6",
      email: "diana.prince@example.com",
      name: "Diana Prince",
      discountWon: "30%",
      device: "Mobile",
      discountCode: "windiscount30678",
    },
    {
      id: "7",
      email: "edward.norton@example.com",
      name: "Edward Norton",
      discountWon: "40%",
      device: "Desktop",
      discountCode: "windiscount40789",
    },
    {
      id: "8",
      email: "fiona.apple@example.com",
      name: "Fiona Apple",
      discountWon: "28%",
      device: "Mobile",
      discountCode: "windiscount28890",
    },
  ];

  const resourceName = {
    singular: "result",
    plural: "results",
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(mockTableData);

  const rowMarkup = mockTableData.map(
    ({ id, email, name, discountWon, device, discountCode }, index) => (
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
        <IndexTable.Cell>{device}</IndexTable.Cell>
        <IndexTable.Cell>{discountCode}</IndexTable.Cell>
      </IndexTable.Row>
    ),
  );

  return (
    <Page title="Analytics">
      <BlockStack gap="500">
        {/* Statistics Cards */}
        <InlineGrid columns={{ xs: 1, sm: 2, md: 4 }} gap="400">
          <Card>
            <BlockStack gap="200">
              <Tooltip content="The total number of games played by users on the platform">
                <div style={{ position: 'relative', cursor: 'help', display: 'inline-block', paddingBottom: '2px' }}>
                  <Text variant="headingSm" as="h2">
                    Games Played
                  </Text>
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    backgroundImage: 'repeating-linear-gradient(to right,rgb(220, 220, 220) 7px,rgb(220, 220, 220) 10px, transparent 4px, transparent 12px)'
                  }} />
                </div>
              </Tooltip>
              <Text variant="headingLg" as="p">
                {stats.gamesPlayed.toLocaleString()}
              </Text>
            </BlockStack>
          </Card>
          <Card>
            <BlockStack gap="200">
              <Tooltip content="The average discount percentage won by users across all games">
                <div style={{ position: 'relative', cursor: 'help', display: 'inline-block', paddingBottom: '2px' }}>
                  <Text variant="headingSm" as="h2">
                    Average Discount Win
                  </Text>
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    backgroundImage: 'repeating-linear-gradient(to right,rgb(220, 220, 220) 7px,rgb(220, 220, 220) 10px, transparent 4px, transparent 12px)'
                  }} />
                </div>
              </Tooltip>
              <Text variant="headingLg" as="p">
                {stats.averageDiscountWin}%
              </Text>
            </BlockStack>
          </Card>
          <Card>
            <BlockStack gap="200">
              <Tooltip content="The total number of users who have subscribed to receive email updates">
                <div style={{ position: 'relative', cursor: 'help', display: 'inline-block', paddingBottom: '2px' }}>
                  <Text variant="headingSm" as="h2">
                    Subscribers
                  </Text>
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    backgroundImage: 'repeating-linear-gradient(to right,rgb(220, 220, 220) 7px,rgb(220, 220, 220) 10px, transparent 4px, transparent 12px)'
                  }} />
                </div>
              </Tooltip>
              <Text variant="headingLg" as="p">
                {stats.emailSubscribers.toLocaleString()}
              </Text>
            </BlockStack>
          </Card>
          <Card>
            <BlockStack gap="200">
              <Tooltip content="The percentage of users who completed a game and claimed their discount">
                <div style={{ position: 'relative', cursor: 'help', display: 'inline-block', paddingBottom: '2px' }}>
                  <Text variant="headingSm" as="h2">
                    Conversion Rate
                  </Text>
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    backgroundImage: 'repeating-linear-gradient(to right,rgb(220, 220, 220) 7px,rgb(220, 220, 220) 10px, transparent 4px, transparent 12px)'
                  }} />
                </div>
              </Tooltip>
              <Text variant="headingLg" as="p">
                {stats.conversionRate}%
              </Text>
            </BlockStack>
          </Card>
        </InlineGrid>

        {/* Index Table */}
        <Card>
          <div style={{ margin: '-16px', overflow: 'hidden', borderRadius: '8px' }}>
            <IndexTable
              resourceName={resourceName}
              itemCount={mockTableData.length}
              selectedItemsCount={
                allResourcesSelected ? "All" : selectedResources.length
              }
              onSelectionChange={handleSelectionChange}
              headings={[
                { title: "Email" },
                { title: "Name" },
                { title: "Discount Won", alignment: "end" },
                { title: "Device" },
                { title: "Discount Code" },
              ]}
            >
              {rowMarkup}
            </IndexTable>
          </div>
        </Card>
      </BlockStack>
    </Page>
  );
}
