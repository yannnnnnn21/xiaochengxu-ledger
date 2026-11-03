package com.warmledger.backend.common;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public final class CategoryCatalog {

    public static final String EXPENSE = "expense";
    public static final String INCOME = "income";

    private static final Map<String, CategoryMeta> META = new LinkedHashMap<>();
    private static final List<String> EXPENSE_CATEGORIES = Arrays.asList(
            "餐饮", "交通", "学习", "娱乐", "兼职", "其他支出"
    );
    private static final List<String> INCOME_CATEGORIES = Arrays.asList(
            "生活费", "兼职", "奖学金", "红包", "其他收入"
    );

    static {
        add("餐饮", "🍜", "peach", "#ef9b70");
        add("交通", "🚌", "blue", "#91b8d3");
        add("学习", "📖", "sage", "#9fbea5");
        add("娱乐", "🎮", "lilac", "#c7aed9");
        add("兼职", "💼", "yellow", "#f1ce6d");
        add("生活费", "🧺", "yellow", "#f1ce6d");
        add("奖学金", "🎓", "sage", "#9fbea5");
        add("红包", "🧧", "peach", "#ef9b70");
        add("其他收入", "✨", "lilac", "#c7aed9");
        add("其他支出", "🧸", "blue", "#91b8d3");
    }

    private CategoryCatalog() {
    }

    private static void add(String name, String icon, String tone, String color) {
        META.put(name, new CategoryMeta(name, icon, tone, color));
    }

    public static CategoryMeta get(String category, String type) {
        CategoryMeta meta = META.get(category);
        if (meta != null) {
            return meta;
        }
        return META.get(EXPENSE.equals(type) ? "其他支出" : "其他收入");
    }

    public static boolean supports(String type, String category) {
        if (EXPENSE.equals(type)) {
            return EXPENSE_CATEGORIES.contains(category);
        }
        if (INCOME.equals(type)) {
            return INCOME_CATEGORIES.contains(category);
        }
        return false;
    }

    public static List<CategoryMeta> list(String type) {
        List<String> names = INCOME.equals(type) ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
        List<CategoryMeta> categories = new ArrayList<>();
        for (String name : names) {
            categories.add(META.get(name));
        }
        return Collections.unmodifiableList(categories);
    }

    public static final class CategoryMeta {

        private final String name;
        private final String icon;
        private final String tone;
        private final String color;

        public CategoryMeta(String name, String icon, String tone, String color) {
            this.name = name;
            this.icon = icon;
            this.tone = tone;
            this.color = color;
        }

        public String getName() {
            return name;
        }

        public String getIcon() {
            return icon;
        }

        public String getTone() {
            return tone;
        }

        public String getColor() {
            return color;
        }
    }
}

