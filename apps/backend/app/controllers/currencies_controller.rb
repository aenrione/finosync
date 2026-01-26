class CurrenciesController < ApplicationController
    def index
        # Parameters for search and pagination
        query = params[:q].to_s.downcase
        page = params[:page].to_i > 0 ? params[:page].to_i : 1
        per_page = params[:per_page].to_i > 0 ? params[:per_page].to_i : 5

        # Build currencies array
        currencies = Money::Currency.table.values.map do |currency|
            {
                iso_code: currency[:iso_code],
                name: currency[:name],
                symbol: currency[:symbol]
            }
        end

        # Move clp, usd, eur to the top
        priority_codes = %w[clp usd eur btc eth utf]
        currencies = currencies.sort_by do |c|
            idx = priority_codes.index(c[:iso_code].to_s.downcase)
            idx.nil? ? priority_codes.size : idx
        end

        # Search filter
        if query.present?
            currencies = currencies.select do |c|
                c[:iso_code].to_s.downcase.include?(query) ||
                c[:name].to_s.downcase.include?(query) ||
                c[:symbol].to_s.downcase.include?(query)
            end
        end

        # Pagination
        total = currencies.size
        currencies = currencies.slice((page - 1) * per_page, per_page) || []

        render json: {
            currencies: currencies,
            page: page,
            per_page: per_page,
            total: total
        }
    end
end