package com.warmledger.backend;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ActiveProfiles("test")
@AutoConfigureMockMvc
@SpringBootTest
class BillApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldCompleteCrudAndStatisticsFlow() throws Exception {
        String createBody = "{"
                + "\"type\":\"expense\","
                + "\"category\":\"餐饮\","
                + "\"amount\":18.50,"
                + "\"date\":\"2026-10-30\","
                + "\"time\":\"12:30\","
                + "\"note\":\"午餐\""
                + "}";

        MvcResult createResult = mockMvc.perform(post("/api/bills")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.category").value("餐饮"))
                .andExpect(jsonPath("$.data.amount").value(18.5))
                .andReturn();

        JsonNode created = objectMapper.readTree(createResult.getResponse().getContentAsString());
        long billId = created.path("data").path("id").asLong();

        mockMvc.perform(get("/api/bills")
                        .param("month", "2026-10")
                        .param("page", "1")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.total").value(1))
                .andExpect(jsonPath("$.data.records[0].note").value("午餐"));

        mockMvc.perform(get("/api/statistics/monthly")
                        .param("month", "2026-10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.expenseAmount").value(18.5))
                .andExpect(jsonPath("$.data.incomeAmount").value(0))
                .andExpect(jsonPath("$.data.billCount").value(1));

        mockMvc.perform(get("/api/statistics/categories")
                        .param("month", "2026-10")
                        .param("type", "expense"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalAmount").value(18.5))
                .andExpect(jsonPath("$.data.items[0].category").value("餐饮"))
                .andExpect(jsonPath("$.data.items[0].percent").value(100));

        String updateBody = "{"
                + "\"type\":\"expense\","
                + "\"category\":\"餐饮\","
                + "\"amount\":20.00,"
                + "\"date\":\"2026-10-30\","
                + "\"time\":\"12:45\","
                + "\"note\":\"午餐加饮料\""
                + "}";

        mockMvc.perform(put("/api/bills/{id}", billId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.amount").value(20))
                .andExpect(jsonPath("$.data.note").value("午餐加饮料"));

        mockMvc.perform(get("/api/statistics/overview")
                        .param("month", "2026-10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.monthly.expenseAmount").value(20))
                .andExpect(jsonPath("$.data.recentBills[0].id").value(billId));

        mockMvc.perform(delete("/api/bills/{id}", billId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));

        mockMvc.perform(get("/api/bills/{id}", billId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(404));
    }

    @Test
    void shouldRejectMismatchedCategory() throws Exception {
        String body = "{"
                + "\"type\":\"income\","
                + "\"category\":\"餐饮\","
                + "\"amount\":10,"
                + "\"date\":\"2026-10-30\""
                + "}";

        mockMvc.perform(post("/api/bills")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));
    }

    @Test
    void shouldAllowAxiosCorsPreflightRequest() throws Exception {
        mockMvc.perform(options("/api/bills")
                        .header("Origin", "http://localhost:3000")
                        .header("Access-Control-Request-Method", "POST")
                        .header("Access-Control-Request-Headers", "Content-Type"))
                .andExpect(status().isOk())
                .andExpect(header().string(
                        "Access-Control-Allow-Origin",
                        "http://localhost:3000"
                ))
                .andExpect(header().exists("Access-Control-Allow-Methods"));
    }
}

